const { Quarantine, QuarantineObject } = require('../models/quarantine')
const { findNonExistingId } = require('./cryptoService')

/**
 * Filter a quarantine object to only keep the attributes safe to send to the client
 * @param {QuarantineObject} quarantine
 */
const quarantineFilter = quarantine => ({
    id: quarantine.client_id,
    email_sender: quarantine.email_sender,
    email_subject: quarantine.email_subject,
    email_size: quarantine.email_size,
    created_at: quarantine.created_at
})

/**
 * Test function, return true if the client_id is already used in Quarantine table
 * @param {string} client_id
 * @returns
 */
const doClientIdExist = async client_id =>
    (await Quarantine.findOne({ where: { client_id: client_id } })) !== null

/**
 * Find a client id that is not already used in Quarantine
 * @returns
 */
const findNonExistingClientId = () => findNonExistingId(doClientIdExist)

/**
 * Create a client_id with a new value for the selected email.
 * @param {number} id - The real id of the email in the Quarantine table
 * @returns
 */
const createEmailClientId = async id =>
    Quarantine.update({ client_id: await findNonExistingClientId() }, { where: { id: id } })

/**
 * Find the email among the user emails
 * @param {number} user_id
 * @param {string} client_id
 * @returns {Promise<QuarantineObject>}
 */
const checkEmailService = (user_id, client_id) =>
    Quarantine.findOne({
        where: {
            fk_user: user_id,
            client_id: client_id,
            to_eliminate: false,
            to_restore: false,
            was_restored: false
        }
    })

/**
 * Return all emails corresponding to this user
 * @param {number} user_id
 * @returns
 */
const getAllEmailsService = async user_id => {
    /** @type {QuarantineObject[]} */
    const emails = await Quarantine.findAll({
        where: { fk_user: user_id, to_eliminate: false, to_restore: false, was_restored: false }
    })
    // createEmailClientId is asynchronous, so we launch all operations in parallel here
    await Promise.all(
        emails.filter(email => email.client_id === null).map(email => createEmailClientId(email.id))
    )
    return emails
}

/**
 * Delete the specified email
 * @param {number} id - The email id
 * @returns {Promise<[number, QuarantineObject[]]>}
 */
const deleteEmailService = id => Quarantine.update({ to_eliminate: true }, { where: { id: id } })

/**
 * Restore the email for which the sender has solved a captcha
 * @param {string} id - the email id (given to the sender)
 * @param {string} sender - the email address of the sender
 */
const restoreEmailForCaptchaService = async (id, sender) => {
    /** @type QuarantineObject */
    const email = await Quarantine.findOne({
        where: { id: id, email_sender: sender, to_eliminate: false, to_restore: false, was_restored: false }
    })
    if (!email) return undefined
    return restoreEmailService(email.id)
}

/**
 * Restore the specified email
 * @param {number} id - The email id
 * @returns {Promise<QuarantineObject>}
 */
const restoreEmailService = async id => {
    await Quarantine.update({ to_restore: true }, { where: { id: id } })
    return Quarantine.findOne({ where: { id: id } })
}

/**
 * Eliminate or restore emails addressed to the user from the specified address
 * @param {number} user_id - The id of the user
 * @param {number} sender - The email address
 * @param {boolean} mustDelete - if true, then the emails will be deleted, else they will be restored
 * @returns {Promise<QuarantineObject[]>}
 */
const handleSenderEmails = async (user_id, sender, mustDelete) => {
    await Quarantine.update(
        { to_restore: !mustDelete, to_eliminate: mustDelete },
        {
            where: {
                fk_user: user_id,
                email_sender: sender,
                to_restore: false,
                to_eliminate: false,
                was_restored: false
            }
        }
    )
    return Quarantine.findAll({
        where: {
            fk_user: user_id,
            email_sender: sender,
            to_restore: !mustDelete,
            to_eliminate: mustDelete,
            was_restored: false
        }
    })
}

module.exports = {
    checkEmailService,
    deleteEmailService,
    getAllEmailsService,
    handleSenderEmails,
    quarantineFilter,
    restoreEmailForCaptchaService,
    restoreEmailService
}
