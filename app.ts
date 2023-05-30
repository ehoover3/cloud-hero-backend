import express, { Request, Response } from "express";
import AWS, { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";

const app = express();
require("dotenv").config();

const port = process.env.PORT || 3000;

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create an instance of the DynamoDB DocumentClient
const docClient = new DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME;

app.use(bodyParser.json());

app.post("/", (req: Request, res: Response) => {
  const itemId = uuidv4();
  const params: any = {
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
    } else {
      console.log("Item created successfully");
      res.status(200).send("Item created successfully");
    }
  });
});

app.get("/", (req: Request, res: Response) => {
  const params: any = {
    TableName: tableName,
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Error retrieving items:", err);
      res.status(500).send("Error retrieving items");
    } else {
      console.log("Items retrieved successfully:", data.Items);
      res.status(200).send(data.Items);
    }
  });
});

app.get("/:id", (req: Request, res: Response) => {
  const params: any = {
    TableName: tableName,
    Key: {
      id: req.params.id,
    },
  };

  docClient.get(params, (err, data) => {
    if (err) {
      console.error("Error retrieving item:", err);
      res.status(500).send("Error retrieving item");
    } else {
      if (data.Item) {
        console.log("Item retrieved successfully:", data.Item);
        res.status(200).send(data.Item);
      } else {
        console.log("Item not found");
        res.status(404).send("Item not found");
      }
    }
  });
});

app.put("/:id", (req: Request, res: Response) => {
  const params: any = {
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
    } else {
      console.log("Item updated successfully");
      res.status(200).send("Item updated successfully");
    }
  });
});

app.delete("/:id", (req: Request, res: Response) => {
  const params: any = {
    TableName: tableName,
    Key: {
      id: req.params.id,
    },
  };

  docClient.delete(params, (err, data) => {
    if (err) {
      console.error("Error deleting item:", err);
      res.status(500).send("Error deleting item");
    } else {
      console.log("Item deleted successfully");
      res.status(200).send("Item deleted successfully");
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
