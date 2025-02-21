import * as AiService from "../services/ai.service.js"

export const getResponse = async (req, res, next) => {

    try {
        const { prompt } = req.query;

        const response = await AiService.generateResult(prompt);

        res.status(200).json({
            response
        })

    } catch (error) {
        res.status(400).json({
            messsage: "Unable to respond",
            errors: error.message
        })
    }
}