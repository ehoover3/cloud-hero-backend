import express from "express";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const app = express();
const tableName = process.env.DYNAMODB_TABLE_NAME || "cloudhero";
app.use(express.json());

if (process.env.PORT === "3000") {
  AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
} else {
  AWS.config.update({ region: process.env.AWS_REGION });
}

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});

app.get("/", (req: Request, res: Response) => {
  const params = {
    TableName: tableName,
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.error(err);
      const errorResponse = {
        error: "Unable to retrieve items",
        errorDetails: err,
      };
      res.status(500).send(JSON.stringify(errorResponse, null, 2));
    } else {
      res.json(data.Items);
    }
  });
});

app.post("/items", (req: Request, res: Response) => {
  const { id, name } = req.body;

  const params = {
    TableName: tableName,
    Item: { id, name },
  };

  dynamodb.put(params, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: err.message || "Unable to create item" });
    } else {
      res.sendStatus(201);
    }
  });
});

app.put("/items/:id", (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name } = req.body;

  const params = {
    TableName: tableName,
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

app.delete("/items/:id", (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const params = {
    TableName: tableName,
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

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});