import * as validators from '../validators/chat'
import { validate } from '../helpers/validator'
import * as types from '../types'

import { ChatModel } from '../../database/models/chat'

import { DatabaseError, NotFoundError } from '../../errors/errors'

export async function createChat(params: any) {
    const value = validate(params, validators.createChat) as types.createChat

    const result = await ChatModel.create(value)

    if (!result) {
        throw new DatabaseError('Error creating chat')
    }

    return result
}

export async function updateChat(params: any) {
    const value = validate(params, validators.updateChat) as types.updateChat

    const result = await ChatModel.updateOne({ name: value.name }, value.chat, { new: true })

    if (!result.acknowledged) {
        throw new DatabaseError('Error updating chat')
    }

    if (result.matchedCount === 0) {
        throw new NotFoundError('Chat not found!')
    }

    return { result: result.modifiedCount > 0 }
}

export async function deleteChat(params: any) {
    const value = validate(params, validators.deleteChat) as types.deleteChat

    const result = await ChatModel.deleteOne(value)

    if (!result.acknowledged) {
        throw new DatabaseError('Error deleting chat')
    }

    return { result: result.deletedCount > 0 }
}

export async function getChat(params: any) {
    const value = validate(params, validators.getChat) as types.getChat

    // if query is {}, return all chats
    if (Object.keys(value).length === 0) {
        return await ChatModel.find()
    }

    const result = await ChatModel.findOne(value)

    if (!result && Object.keys(value).length !== 0) {
        throw new NotFoundError('Chat not found!')
    }

    return result
}

export async function appendMessage(params: any) {
    const value = validate(params, validators.appendMessage) as types.appendMessage

    const result = await ChatModel.updateOne({ name: value.name }, { $push: { history: value.message } })

    if (!result.acknowledged) {
        throw new DatabaseError('Error appending message')
    }

    if (result.matchedCount === 0) {
        throw new NotFoundError('Chat not found!')
    }

    return { result: result.modifiedCount > 0 }
}
