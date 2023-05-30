"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = __importStar(require("aws-sdk"));
const uuid_1 = require("uuid");
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
require("dotenv").config();
const port = process.env.PORT || 3000;
// Configure AWS SDK
aws_sdk_1.default.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
// Create an instance of the DynamoDB DocumentClient
const docClient = new aws_sdk_1.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME;
app.use(body_parser_1.default.json());
app.post("/", (req, res) => {
    const itemId = (0, uuid_1.v4)();
    const params = {
        TableName: tableName,
        Item: {
            id: itemId,
            message: req.body.message,
        },
    };
    docClient.put(params, (err, data) => {
        if (err) {
            console.error("Error creating item:", err);
            res.status(500).send("Error creating item");
        }
        else {
            console.log("Item created successfully");
            res.status(200).send("Item created successfully");
        }
    });
});
app.get("/", (req, res) => {
    const params = {
        TableName: tableName,
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            console.error("Error retrieving items:", err);
            res.status(500).send("Error retrieving items");
        }
        else {
            console.log("Items retrieved successfully:", data.Items);
            res.status(200).send(data.Items);
        }
    });
});
app.get("/:id", (req, res) => {
    const params = {
        TableName: tableName,
        Key: {
            id: req.params.id,
        },
    };
    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Error retrieving item:", err);
            res.status(500).send("Error retrieving item");
        }
        else {
            if (data.Item) {
                console.log("Item retrieved successfully:", data.Item);
                res.status(200).send(data.Item);
            }
            else {
                console.log("Item not found");
                res.status(404).send("Item not found");
            }
        }
    });
});
app.put("/:id", (req, res) => {
    const params = {
        TableName: tableName,
        Key: {
            id: req.params.id,
        },
        UpdateExpression: "set message = :value1",
        ExpressionAttributeValues: {
            ":value1": req.body.message,
        },
    };
    docClient.update(params, (err, data) => {
        if (err) {
            console.error("Error updating item:", err);
            res.status(500).send("Error updating item");
        }
        else {
            console.log("Item updated successfully");
            res.status(200).send("Item updated successfully");
        }
    });
});
app.delete("/:id", (req, res) => {
    const params = {
        TableName: tableName,
        Key: {
            id: req.params.id,
        },
    };
    docClient.delete(params, (err, data) => {
        if (err) {
            console.error("Error deleting item:", err);
            res.status(500).send("Error deleting item");
        }
        else {
            console.log("Item deleted successfully");
            res.status(200).send("Item deleted successfully");
        }
    });
});
// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
