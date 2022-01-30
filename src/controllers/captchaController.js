const { internalError } = require('../utils')
const { restoreEmailForCaptchaService } = require('../services/quarantineService')
const { createListElementService } = require('../services/listServices')
const express = require('express')
const { verifyCaptcha, sendRestoreSignal } = require('../services/httpService')

/**
 * Error returned when the email id is not in database
 * - used by the captchaController and by OpenAPI
 * @type {import('../utils').errorMessage}
 */
exports.emailNotFoundCaptchaError = {
    type: '/verify-email',
    title: 'Email not found',
    status: 404,
    detail:
        'The email id is not in database. The email was probably removed from quarantine by the user.'
}

/**
 * Error returned when the captcha is incorrect
 * - used by the captchaController and by OpenAPI
 * @type {import('../utils').errorMessage}
 */
exports.incorrectCaptchaError = {
    type: '/verify-captcha',
    title: 'Incorrect captcha',
    status: 404,
    detail: 'The captcha was declared incorrect by Google Recaptcha.'
}

/**
 * Message returned when the captcha is validated
 * - used by verifyController and by OpenAPI
 * @type {import('../utils').Message}
 */
exports.validatedCaptchaMessage = { message: 'Valid captcha' }

/**
 * Controller checking a captcha
 * - the request should go through checkBody first
 * @param {express.Request} req
 * @param {express.Response} res
 * @typedef verifyEmailData
 * @property {string} email
 * @property {string} captchaToken
 */
exports.verifyEmail = async (req, res) => {
    const emailId = req.params.id
    /** @type {verifyEmailData} */
    const data = req.body
    try {
        const response = await verifyCaptcha(data.captchaToken)
        if (response.data.success) {
            const email = await restoreEmailForCaptchaService(emailId, data.email)
            if (!email) {
                res.status(404).json(this.emailNotFoundCaptchaError)
                return
            }
            await createListElementService(true, email.email_sender, email.fk_user)
            await sendRestoreSignal(email.fk_user)
            res.status(200).json(this.validatedCaptchaMessage)
        } else {
            res.status(404).send(this.incorrectCaptchaError)
        }
    } catch (error) {
        res.status(500).json(internalError)
    }
}
