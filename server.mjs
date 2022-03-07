// Import all libraries here
import express from "express";
import cors from "cors";
import mongoose from 'mongoose';
import dialogflow from '@google-cloud/dialogflow';
import { WebhookClient } from 'dialogflow-fulfillment';
import { Suggestion } from "dialogflow-fulfillment";
import { Card, Payload } from "dialogflow-fulfillment";

// Initialized App
const app = express();
app.use(express.json())
app.use(cors())

// PORT
const PORT = process.env.PORT || 4000;

// Dialogflow Snippet/Boiler Plate
const sessionClient = new dialogflow.SessionsClient();

// Database Connection
mongoose.connect(`mongodb+srv://PizzaOrderingChatbot:PizzaOrderingChatbot@pizzaorderingchatbot.kltzi.mongodb.net/PizzaOrderingChatbot?retryWrites=true&w=majority`,


    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((e) => {
        console.log("Something went wrong due to this error", e);
    })

// Talk to Chatbot Webhook Start
// Setting Of Project
app.post("/talktochatbot", async (req, res) => {
    const projectId = "pizza-ordering-app-nqqj"
    const sessionId = "session123"
    const query = req.body.text
    const languageCode = "en-US"

    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    )

    // The text query request.  
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode
            },
        },
    }

    try {
        const response = await sessionClient.detectIntent(request);
        // console.log("Response", response)
        console.log("Response", response[0].queryResult.fulfillmentText)

        res.send({
            text: response[0].queryResult.fulfillmentText
        })
    }
    catch (e) {
        console.log("Error while detecting Intent ", e)
    }

})

// Talk to Chatbot Webhook End
// pizza-ordering-app-nqqj



// Dialog Webhook Start

app.post("/webhook", (req, res) => {
    // Initialized dialogflow-fulfillment library here and use it
    const agent = new WebhookClient({ request: req, response: res });

    // Weclome Intent/Function
    function welcome(agent) {
        agent.add(new Payload("PLATFORM_UNSPECIFIED", {
            "textMessage": [
                "Here is you full menu"
            ]
        }, { rawPayload: true, sendAsMessage: true }))

        agent.add(new Card({
            title: "Pizza Ordering Restaurant",
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/reactaideveloper.appspot.com/o/home2.svg?alt=media&token=70058c35-6d05-4937-bb23-aefd86178caa",
            text: "Welcome to Pizza Ordering Restaurant"
        }))

        // const welcomeMessage =
        //     `
        //     <speak>
        //         <p>
        //             <s>Welcome to Pizza Ordering Restaurant</s>
        //             <s>How may i help you</s>
        //         </p>
        //     </speak>
        // `

        // agent.add(welcomeMessage);
        agent.add("Welcome to Pizza Ordering Restaurant. You can ask me for menu");

        // Suggestion
        agent.add(new Suggestion("What's in the menu"))
        agent.add(new Suggestion("What's your speciality"))
        agent.add(new Suggestion("Cancel"))
    }


    // Fallback function

    function fallback(agent) {
        const fallBackMessage = [
            {
                text: "I didn't get that. Can you say that again",
                ssml:
                    `
                <speak>
                    <p>
                        <s>I didn't get that</s>
                        <s>Can you say that again</s>
                        <s>You can ask me for menu</s>
                    </p>
                </speak>
                `
            },
            {
                text: "I missed that what you said. What was that",
                ssml:
                    `
                <speak>
                    <p>
                        <s>I missed that what you said. </s>
                        <s>What was that</s>
                        <s>You can ask me for menu</s>
                    </p>
                </speak>
                `
            },
            {
                text: "Sorry, can you say that again",
                ssml:
                    `
                <speak>
                    <p>
                        <s>Sorry</s>
                        <s>Can you say that again</s>
                        <s>You can ask me for menu</s>
                    </p>
                </speak>
                `
            }

        ]
        agent.add(fallBackMessage)
    }








    // Map functions to Dialogflow intent names
    let intentMap = new Map();
    // All Function Call here
    intentMap.set("Default Welcome Intent", welcome)

    // Fallback function call here
    intentMap.set("Default Fallback Intent", fallback)


    // Write in the end
    agent.handleRequest(intentMap);
})


// Dialog Webhook End







// Boiler Plate Code
app.get("/", (req, res) => {
    res.send("This is a server of Pizza Ordering App developed by HUZAIFA AHMED");
})
app.get("/profile", (req, res) => {
    res.send("here is your profile");
})
app.get("/about", (req, res) => {
    res.send("some information about me");
})
app.listen(PORT, () => {
    console.log(`The server of Pizza Ordering App developed by HUZAIFA AHMED is running at ${PORT}`);
});