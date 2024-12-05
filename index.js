import snowflake from 'snowflake-sdk'
import fs from 'fs/promises'
import { config } from './config.js'

const main = async () => {
  console.log("Starting to create a snowflake-connection");

  // first write the PK to filesystem
  const isWriteSuccess = await writePem(
    config.snowflake.privateKeyPath,
    config.snowflakePemString,
  );

  if (!isWriteSuccess) {
    return console.log("Aborting snowflake-connection");
  }

  // create the client
  const client = snowflake.createConnection(config.snowflake);

  console.log("Created snowflake-client");

  // create the connection
  await createConnection(client);

  console.log('select top 1 * from ...')
  const result = await snowflakeQuery(client, `select top 1 * from ${config.snowflakeTable};`)

  console.log(result)

  // script done
  console.log('Script end!')
}


const createConnection = (
  client,
) =>
  new Promise((resolve, _reject) => {
    client.connect(async (error, connection) => {
      if (error) {
        console.log(error, "Unable to connect to snowflake-db");
        return resolve(false);
      } else {
        console.log("Successfully connected to snowflake-db!");
        const isConnectionValid = await connection.isValidAsync();
        if (isConnectionValid) {
          console.log("Ready to accept queries");
        }
        return resolve(isConnectionValid);
      }
    });
  });

const writePem = async (
  filePath,
  oneLiner,
) => {
  const isFileExisting = await checkFileExist(filePath);
  if (isFileExisting) {
    console.log("PEM already existing, removing");
    await fs.rm(filePath)
  }

  console.log(`Writing PEM to ${filePath}`);
  try {
    const multiLined = oneLiner.replace(/\\n/g, "\n");
    await fs.writeFile(filePath, multiLined);
    return true;
  } catch (error) {
    console.log(error, "Error writing file");
    return false;
  }
};

const checkFileExist = async (filePath) => {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    return false;
  }
};


const snowflakeQuery = (client, sqlText) => new Promise((resolve, reject) => {
  client.execute({
    sqlText,
    complete: async (error, stmt, rows) => {
      if (error) {
        console.log(error, "Failed to execute statement");
        reject(error);
      } else {
        console.log(
          `Query successfull, got ${rows?.length
          } rows from ${stmt.getSqlText()}`
        );
        resolve(rows);
      }
    },
  });
});

main()
