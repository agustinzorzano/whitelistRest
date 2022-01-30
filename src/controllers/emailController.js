const {
    quarantineFilter,
    getAllEmailsService,
    deleteEmailService,
    restoreEmailService,
    handleSenderEmails
} = require('../services/quarantineService')
const { internalError } = require('../utils')
const express = require('express')
const { findInListService, createListElementService } = require('../services/listServices')
const { sendRestoreSignal } = require('../services/httpService')

exports.getEmail = async (req, res) => {
    const user = req.user // obtained from cookies
    const quarantines = await getAllEmailsService(user.id)
    res.status(200).send(quarantines.map(quarantineFilter))
}

exports.deleteEmail = async (req, res) => {
    const email = req.email
    try {
        await deleteEmailService(email.id)
        res.status(200).json({ message: 'Email deleted.' })
    } catch (error) {
        res.status(500).json(internalError)
    }
}

exports.restoreEmail = async (req, res) => {
    const email = req.email
    try {
        const newmail = await restoreEmailService(email.id)
        await sendRestoreSignal(email.fk_user)
        res.status(200).send(quarantineFilter(newmail))
    } catch (_err) {
        res.status(500).json(internalError)
    }
}

/**
 * Curried controller for Sending the sender of the selected email to the corresponding list
 * - If the sender is already in the list, restore or delete all his mails depending of the list
 * @param {boolean} isWhite
 */
exports.putInList = isWhite =>
    /**
     * @param {express.Request} req
     * @param {express.Response} res
     */
    async (req, res) => {
        /** @type import('../models/quarantine').QuarantineObject */
        const email = req.email
        try {
            const senderInlist = await findInListService(isWhite, email.email_sender, email.fk_user)
            if (senderInlist != null) {
                // If the sender is already in list the quarantine table must have a problem
                // We know there is at least one item to change here thanks to the previous checkemail filter
                const newquarantine = await handleSenderEmails(
                    email.fk_user,
                    email.email_sender,
                    !isWhite
                )
                res.status(200).send(newquarantine[1].map(quarantineFilter))
            } else {
                const result = await createListElementService(
                    isWhite,
                    email.email_sender,
                    email.fk_user
                )
                await handleSenderEmails(email.fk_user, email.email_sender, !isWhite)
                await sendRestoreSignal(email.fk_user)
                res.status(204).send()
            }
        } catch (err) {
            console.log(JSON.stringify(err))
            res.status(500).json(internalError)
        }
    }
