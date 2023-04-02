import STRINGS from "../lib/db.js";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import inputSanitization from "../sidekick/input-sanitization";
import Axios from "axios";
import config from "../config"
const CGPT = STRINGS.cgpt;

module.exports = {
    name: "cgpt",
    description: CGPT.DESCRIPTION,
    extendedDescription: CGPT.EXTENDED_DESCRIPTION,
    demo: {
        isEnabled: false,
        text: [
            ".cgpt tell me a joke",
            ".cgpt write me a pickup line"
        ]
    },

    async handle(
        client: Client,
        chat: proto.IWebMessageInfo,
        BotsApp: BotsApp,
        args: string[]
    ): Promise<void> {
        /*******************************************
         *
         *
         * Functions
         *
         *
         ********************************************/
        const responseFromChatGPT = async (question: string) => {
            let answer = "Could not request ChatGPT!"
            try {
                await Axios.post("https://api.openai.com/v1/chat/completions", {
                    "model": "gpt-3.5-turbo",
                    "messages": [{ "role": "user", "content": question }],
                    "max_tokens": 100
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    }
                }).then((res) => {
                    answer = res.data.choices[0].message.content
                }).catch(() => {
                    answer = "Could not request ChatGPT!"
                })
                return answer
            } catch (error) {
                throw error
            }

        };
        /*******************************************
         *
         *
         * Actions
         *
         *
         ********************************************/
        if (args.length === 0) {
            await client
                .sendMessage(BotsApp.chatId, CGPT.NO_PROMPT, MessageType.text)
                .catch((err) => inputSanitization.handleError(err, client, BotsApp));
            return;
        }
        if (args[0] == "help") {
            await client
                .sendMessage(
                    BotsApp.chatId,
                    CGPT.EXTENDED_DESCRIPTION,
                    MessageType.text
                )
                .catch((err) => inputSanitization.handleError(err, client, BotsApp));
            return;
        } else {
            let question = args.join(" ")
            let answer = await responseFromChatGPT(question);
            let response = `*Your Question:* ${question}\n\n*ChatGPT's Response:* ${answer}`
            await client
                .sendMessage(
                    BotsApp.chatId,
                    response,
                    MessageType.text
                )
                .catch((err) => inputSanitization.handleError(err, client, BotsApp));
            return;
        }
    }
}