import pool from "./db";

const CREATE_TABLE_TEMP_USERS = `create table if not exists temp_users(
	full_name varchar(50) not null,
	email varchar(100) not null,
	hashed_password varchar(255) not null,
	verification_token varchar(255) not null unique,
	created_at timestamp default NOW(),
	token_expiration timestamp default Now() + interval '1 day'
)`;

const CREATE_TABLE_USERS = `create table if not exists users(
	id UUID default gen_random_uuid() primary key,
	full_name varchar(50) not null,
	email varchar(100) not null unique,
	hashed_password varchar(255) not null,
	auth_token varchar(255) not null unique,
	created_at timestamp default NOW()
)`;

const CREATE_TABLE_RESET_PASS = `create table if not exists reset_pass(
	email varchar(100) not null references users(email) on delete cascade,
	reset_token varchar(255) not null unique,
	token_expiration timestamp default now() + interval '1 day'
)`;

const CREATE_TABLE_BUCKET = `create table if not exists bucket(
	id uuid default gen_random_uuid() primary key,
	bucket_name varchar(255) unique not null,
	created_at timestamp default now(),
	user_id uuid references users(id) on delete cascade
)`;

const CREATE_TABLE_FILE = `create table if not exists file(
	id uuid default gen_random_uuid() primary key,
	file_name varchar(255) not null,
	parent_id uuid default null references file(id) on delete cascade,
	file_size bigint not null,
	created_at timestamp default now(),
	is_folder boolean default false,
	user_id uuid references users(id) on delete cascade,
	bucket_id uuid references bucket(id) on delete cascade,
    parent_file_name TEXT GENERATED ALWAYS AS (
        COALESCE(parent_id::TEXT, '') || '_' || file_name
      ) STORED,
	unique (parent_file_name)
)`;

const SELECT_IF_EXISTS_USER_OF_EMAIL = `select 1 from users where email = $1`;

const INSERT_INTO_TEMP_USERS = "insert into temp_users(full_name,email,hashed_password,verification_token) values($1,$2,$3,$4) returning *";

const SELECT_FROM_TEMP_USERS_OF_TOKEN = `select full_name as "fullName", email, hashed_password as "hashedPassword", verification_token as "verificationToken", created_at as "createdAt" from temp_users where verification_token = $1 and NOW() > token_expiration`;

const INSERT_INTO_USERS = "insert into users(full_name,email,hashed_password,auth_token) values($1,$2,$3,$4) returning *";

const DELETE_EXPIRED_FROM_TEMP_USERS = "delete from temp_users where token_expiration < NOW()";

const DELETE_ENTRY_FROM_TEMP_USERS = "delete from temp_users where verification_token = $1";

const SELECT_LOGIN_USER = `select id, full_name as "fullName",email, auth_token as "authToken", created_at as "createdAt", hashed_password as "hashedPassword" from users where email = $1`;

const INSERT_INTO_RESET_PASS = "insert into reset_pass(email,reset_token) values ($1,$2) returning *";

const SELECT_IF_EXISTS_USER_OF_AUTHTOKEN = "select 1 from users where auth_token = $1";

const SELECT_IF_EXISTS_RESET_PASS_OF_TOKEN = "select 1 from reset_pass where reset_token = $1 and NOW() > token_expiration";

const UPDATE_USER_PASSWORD = `update users as u set hashed_password = $1, auth_token = $2 from reset_pass as r where u.email = r.email and r.reset_token = $3`;

const DELETE_FROM_RESET_PASS_OF_TOKEN = `delete from reset_pass where reset_token = $1`;

const SELECT_FROM_BUCKET_WITH_USER_ID = `select id as "bucketId", bucket_name as "bucketName", created_at as "createdAt", user_id as "userId" from bucket where user_id = $1 order by created_at desc`;

const SELECT_USER_WITH_TOKEN = `select id as "userId", full_name as "userName" from users where auth_token = $1`;

const INSERT_INTO_BUCKET = `insert into bucket(bucket_name,user_id) values($1,$2) returning *`;

const DELETE_FROM_BUCKET_WITH_ID = `delete from bucket where user_id = $1 and id = $2`;

const UPDATE_BUCKET_NAME = `update bucket set bucket_name = $1 where user_id = $2 and id = $3 returning *`;

const SELECT_FOLDER_DETAILS = `select id, file_name as "fileName", parent_id as "parentId", file_size as "fileSize", created_at as "createdAt", is_folder as "isFolder" from file where user_id = $1 and bucket_id = $2 and parent_id = $3 and file_name = $4`;

const SELECT_FOLDER_DETAILS_WHERE_PARENT_ID_IS_NULL = `select id, file_name as "fileName", parent_id as "parentId", file_size as "fileSize", created_at as "createdAt", is_folder as "isFolder" from file where user_id = $1 and bucket_id = $2 and parent_id is null and file_name = $3`;

const SELECT_FILES_WITH_PARENT_ID_NULL = `select id, file_name as "fileName", parent_id as "parentId", file_size as "fileSize", created_at as "createdAt", is_folder as "isFolder" from file where user_id = $1 and bucket_id = $2 and parent_id is null order by created_at desc limit 50 offset ($3-1)*50`;

const SELECT_FILES_WITH_PARENT_ID = `select id, file_name as "fileName", parent_id as "parentId", file_size as "fileSize", created_at as "createdAt", is_folder as "isFolder" from file where user_id = $1 and bucket_id = $2 and parent_id = $3 order by created_at desc limit 50 offset ($4-1)*50`;

const INSERT_FOLDER_INTO_FILE = `insert into file(file_name,parent_id,file_size,is_folder,user_id,bucket_id) values($1, $2,-1,true,$3,$4) returning *`;

const INSERT_FILE_INTO_FILE = `insert into file(file_name,parent_id,file_size,is_folder,user_id,bucket_id) values($1, $2,$3,false,$4,$5) returning *`;

const DELETE_FILE_WITH_ID = `delete from file where id = $1 and user_id = $2`;

const UPDATE_FILE_NAME_WITH_ID = `update file set file_name = $1 where id = $2 and user_id = $3 and bucket_id = $4`;

const SELECT_IF_FILE_EXISTS_FOR_PARENTID_NULL = `select 1 from file where parent_id is null and file_name = $1`;

const SELECT_IF_FILE_EXISTS_FOR_PARENTID = `select 1 from file where parent_id = $1 and file_name = $2`;

export async function createTableTempUsers(){
    try{
        await pool.query(CREATE_TABLE_TEMP_USERS);
    } catch(e){
        console.log(e);
    }
}

export async function createTableUsers(){
    try{
        await pool.query(CREATE_TABLE_USERS);
    } catch(e){
        console.log(e);
    }
}

export async function createTableResetPass(){
    try{
        await pool.query(CREATE_TABLE_RESET_PASS);
    } catch(e){
        console.log(e);
    }
}

export async function selectIfExistsUserOfEmail(email){
    try{
        return await pool.query(SELECT_IF_EXISTS_USER_OF_EMAIL, [email]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function insertIntoTempUsers(fullName,email,hashedPassword,verificationToken){
    try{
        await createTableTempUsers();
        return await pool.query(INSERT_INTO_TEMP_USERS, [fullName,email,hashedPassword,verificationToken]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function selectFromTempUsersOfToken(verificationToken){
    try{
        return await pool.query(SELECT_FROM_TEMP_USERS_OF_TOKEN, [verificationToken]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function insertIntoUsers(fullName,email,hashedPassword,authToken){
    try{
        await createTableUsers();
        return await pool.query(INSERT_INTO_USERS, [fullName,email,hashedPassword,authToken]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function deleteExpiredFromTempUsers(){
    try{
        await pool.query(DELETE_EXPIRED_FROM_TEMP_USERS);
    } catch(err){
        console.log(null);
    }
}

export async function deleteFromTempUsersWithVerificationToken(verificationToken){
    try{
        await pool.query(DELETE_ENTRY_FROM_TEMP_USERS,[verificationToken]);
    } catch(err){
        console.log(err);
    }
}

export async function getLoginUser(email){
    try{
        return pool.query(SELECT_LOGIN_USER, [email]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function insertIntoResetPass(email,resetToken){
    try{
        await createTableResetPass();
        return pool.query(INSERT_INTO_RESET_PASS,[email,resetToken]);
    } catch(err){
        console.log(err);
        //If user doesn't exist
        if(err.code == '23503'){
            return {
                error: "User doesn't exist."
            };
        }
        return null;
    }
}

export async function selectIfExistsUserOfAuthToken(authToken){
    try{
        return await pool.query(SELECT_IF_EXISTS_USER_OF_AUTHTOKEN, [authToken]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function selectIfExistsResetPassOfToken(resetToken){
    try{
        return await pool.query(SELECT_IF_EXISTS_RESET_PASS_OF_TOKEN, [resetToken]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function updateUserCredentials(newHashedPassword,newAuthToken,resetToken){
    try{
        return await pool.query(UPDATE_USER_PASSWORD,[newHashedPassword,newAuthToken,resetToken]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function deleteFromResetPassOfToken(resetToken){
    try{
        return await pool.query(DELETE_FROM_RESET_PASS_OF_TOKEN,[resetToken]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function createTableBucket(){
    try{
        await pool.query(CREATE_TABLE_BUCKET);
    } catch(err){
        console.log(err);
    }
}

export async function getBucketsOfUser(userId){
    try{
        return await pool.query(SELECT_FROM_BUCKET_WITH_USER_ID, [userId]);
    } catch(err){
        if(err.code == '42P01'){
            return {
                "rows": []
            }
        }
        console.log(err);
        return null;
    }
}

export async function getUserWithToken(authToken){
    try{
        return await pool.query(SELECT_USER_WITH_TOKEN, [authToken]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function insertIntoBucket(bucketName, userId){
    try{
        await createTableBucket();
        return await pool.query(INSERT_INTO_BUCKET, [bucketName, userId]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function deleteFromBucketWithId(userId,bucketId){
    try{
        await pool.query(DELETE_FROM_BUCKET_WITH_ID, [userId,bucketId]);
        return true;
    } catch(err){
        console.log(err);
        return false
    }
}

export async function updateBucketName(newBucketName,userId,bucketId){
    try{
        return await pool.query(UPDATE_BUCKET_NAME,[newBucketName,userId,bucketId]);
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function createTableFile(){
    try{
        await pool.query(CREATE_TABLE_FILE);
    } catch(err){
        console.log(err);
    }
}

export async function getFolderDetails(userId, bucketId, parentId, fileName){
    try{
        if(parentId == null){
            return await pool.query(SELECT_FOLDER_DETAILS_WHERE_PARENT_ID_IS_NULL,[userId, bucketId, fileName]);
        }
        return await pool.query(SELECT_FOLDER_DETAILS,[userId, bucketId, parentId, fileName]);
    } catch(err){
        if(err.code == '42P01'){
            return {
                "rows": []
            }
        }
        console.log(err);
        return null;
    }
}

export async function getFilesWithParentId(userId, bucketId, parentId,page){
    try{
        if(parentId == null){
            return await pool.query(SELECT_FILES_WITH_PARENT_ID_NULL,[userId, bucketId, page]);
        }
        return await pool.query(SELECT_FILES_WITH_PARENT_ID,[userId, bucketId, parentId, page]);
    } catch(err){
        if(err.code == '42P01'){
            return {
                "rows": []
            }
        }
        console.log(err);
        return null;
    }
}

export async function insertFolderIntoFile(fileName,parentId,userId,bucketId){
    try{
        await createTableFile();
        return await pool.query(INSERT_FOLDER_INTO_FILE,[fileName,parentId,userId,bucketId]);
    } catch(err){
        console.log(err);
        if(err.code == '23505'){
            return {
                error: 'File already exists'
            }
        }
        return null;
    }
}

export async function insertFileIntoFile(fileName,parentId,fileSize,userId,bucketId){
    try{
        await createTableFile();
        return await pool.query(INSERT_FILE_INTO_FILE,[fileName,parentId,fileSize,userId,bucketId]);
    } catch(err){
        console.log(err);
        if(err.code == '23505'){
            return {
                error: 'File already exists'
            }
        }
        return null;
    }
}

export async function deleteFromFileWithId(fileId,userId){
    try{
        return await pool.query(DELETE_FILE_WITH_ID,[fileId,userId])
    } catch(err){
        console.log(err);
        return null;
    }
}

export async function updateFileNameWithId(newFileName, fileId, userId, bucketId){
    try{
        return await pool.query(UPDATE_FILE_NAME_WITH_ID,[newFileName,fileId,userId,bucketId]);
    } catch(err){
        console.log(err);
        if(err.code == '23505'){
            return {
                error: 'File already exists'
            }
        }
        return null;
    }
}

export async function selectIfFileExistsForParent(parentId, fileName){
    try{
        if(parentId == null){
            return await pool.query(SELECT_IF_FILE_EXISTS_FOR_PARENTID_NULL, [fileName]);
        }
        return await pool.query(SELECT_IF_FILE_EXISTS_FOR_PARENTID,[parentId,fileName] );
    } catch(err){
        console.log(err)
        return null;
    }
}


