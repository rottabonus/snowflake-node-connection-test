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
    console.log("PEM already existing, dont write again");
    return true;
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

main()
