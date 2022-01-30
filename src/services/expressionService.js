const { WhiteList } = require('../models/list')
const { WhiteListRegularExpression, BlackListRegularExpression } = require('../models/regex')

/**
 * Find if the expression belongs to a regularExpression table or a list table
 * @param {string} expression
 */
const isExpression = expression => /.*\*.*/.test(expression)

const replaceAllRegexSpecial = str => {
    var mystr = str
    const regexSpecial = "?[$#+-|'.,!^()]/{}=<>"
    regexSpecial.split('').forEach(c => {
        mystr = mystr.replace(new RegExp('\\' + c, 'g'), '\\' + c)
    })
    return mystr
}

/**
 * Transform an expression given by the user into a regex that the backend can use
 * @param {string} expression
 * @returns {string}
 */
const fromUserExpressionToRegex = expression =>
    replaceAllRegexSpecial(expression).replace(/\*/g, '.*')

/**
 * Create a new expression in one of the table
 * - if isWhite is true, the expression will be created in WhiteListRegularExpression
 * - else it will be in BlackListRegularExpression
 * - both have same argument so it's not a problem
 * @param {boolean} isWhite
 * @param {string} expression
 * @param {number} user_id
 * @returns {Promise<import('../models/regex').ExpressionObject>}
 */
const createExpressionService = (isWhite, expression, user_id) => {
    const List = isWhite ? WhiteListRegularExpression : BlackListRegularExpression
    const regex = fromUserExpressionToRegex(expression)
    return List.create({
        user_expression: expression,
        expression: regex,
        fk_user: user_id
    })
}

/**
 * Delete the expression in WhiteListRegularExpression and BlackListRegularExpression
 * @param {string} expression - the user expression to delete
 * @param {number} user_id - the user owning the lists
 */
const deleteExpressionService = async (expression, user_id) => {
    const wexps = await WhiteListRegularExpression.findAll({
        where: { user_expression: expression, fk_user: user_id }
    })
    wexps.forEach(async exp => await exp.destroy())
    const bexps = await BlackListRegularExpression.findAll({
        where: { user_expression: expression, fk_user: user_id }
    })
    bexps.forEach(async exp => await exp.destroy())
}

/**
 * Find all expressions of one user on the whitelist or blacklist
 * @param {boolean} isWhite - if true, then search in whitelist, else in blacklist
 * @param {number} user_id
 * @returns {Promise<import('../models/regex').ExpressionObject[]>}
 */
const findAllExpressionService = (isWhite, user_id) => {
    const List = isWhite ? WhiteListRegularExpression : BlackListRegularExpression
    return List.findAll({ where: { fk_user: user_id } })
}

module.exports = {
    isExpression,
    deleteExpressionService,
    findAllExpressionService,
    fromUserExpressionToRegex,
    createExpressionService
}
