"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const region = process.env.region || "us-east-1";
const table = process.env.DYNAMODB_TABLE_NAME || "cloudhero";
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
app.use(express_1.default.json());
if (port === 3000) {
    aws_sdk_1.default.config.update({
        region: region,
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    });
}
else {
    aws_sdk_1.default.config.update({ region: region });
}
const dynamodb = new aws_sdk_1.default.DynamoDB.DocumentClient({
    region: "us-east-1",
});
app.get("/", (req, res) => {
    const params = {
        TableName: table,
    };
    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.error(err);
            const errorResponse = {
                error: "Unable to retrieve items",
                errorDetails: err,
            };
            res.status(500).send(JSON.stringify(errorResponse, null, 2));
        }
        else {
            res.json(data.Items);
        }
    });
});
app.post("/items", (req, res) => {
    const { id, name } = req.body;
    const params = {
        TableName: table,
        Item: { id, name },
    };
    dynamodb.put(params, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err.message || "Unable to create item" });
        }
        else {
            res.sendStatus(201);
        }
    });
});
app.put("/items/:id", (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    const params = {
        TableName: table,
        Key: { id },
        UpdateExpression: "set #name = :nameValue",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":nameValue": name },
    };
    dynamodb.update(params, (err) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.sendStatus(200);
    });
});
app.delete("/items/:id", (req, res, next) => {
    const { id } = req.params;
    const params = {
        TableName: table,
        Key: { id },
    };
    dynamodb.delete(params, (err) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.sendStatus(200);
    });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
