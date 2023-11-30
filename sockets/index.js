import express from "express";
import http from "http";
import { Server } from "socket.io";


const HTTP_PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

var numClients = {};
var clientNames = {};
var rematchCounter = 0;
var roomDataObjects = [];
  // {
  //   "roomId":roomId, // socket roomId
  //   user1: user1Name,
  //   user2: user2Name,
  //   audio1: '',
  //   audio2: ''
  // }

var usersWaitingForRandomMatch = [];
var usersWaitingForCodeMatch = [];
// By default we can have randomMatch users join default room

// when users are matched they will both join a room

// then the room emits 'startSinging' event

// in response, the game mode will start
 



io.on('connection', (socket) => {
    console.log("a user connected");

    socket.on('disconnect', () => {
        console.log("a user disconnected"); 
        // we need to remove the disconnected user from the lists of matching
        if (usersWaitingForCodeMatch.findIndex((user)=> {user.socket.id === socket.id}) > 0){
          usersWaitingForCodeMatch.splice(usersWaitingForCodeMatch.findIndex((user)=> {user.socket.id === socket.id}),1);

        };
        if (usersWaitingForRandomMatch.findIndex((user)=> {user.socket.id === socket.id}) > 0){
          usersWaitingForRandomMatch.splice(usersWaitingForRandomMatch.findIndex((user)=> {user.socket.id === socket.id}),1);

        };
        
    });

    socket.on('testConnection', () => {
        console.log("TEST SUCCESSFUL");
    });
    
  





    socket.on('waitForRandomMatch', (userMatchDetailsObject) => {
      // find another user in the usersWaitingForRandomMatch array that is searching for 
      // a user with this song
      console.log('UserRandomMatch');
      console.log(JSON.stringify(userMatchDetailsObject));
      const userJoinObject = {"socket": socket, "userMatchDetailsObject": userMatchDetailsObject };

      // by using findIndex(), we are matching to the longest waiting user in the queue
      const indexOfMatch = usersWaitingForRandomMatch.findIndex(userWaiting => userWaiting.userMatchDetailsObject.option === userMatchDetailsObject.option)
      console.log("index of match: " + indexOfMatch);
      console.log("current users waiting: " + usersWaitingForRandomMatch.length);
      console.log('waiting:', usersWaitingForRandomMatch?.[indexOfMatch]?.userMatchDetailsObject?.username, usersWaitingForRandomMatch?.[indexOfMatch]?.userMatchDetailsObject?.userMatchCode);
      console.log('joining: ', userMatchDetailsObject.username, userMatchDetailsObject.userMatchCode);
      const imAlreadyInQueue = (usersWaitingForRandomMatch?.[indexOfMatch]?.userMatchDetailsObject?.userMatchCode == userMatchDetailsObject.userMatchCode);

      if (indexOfMatch > -1 && !imAlreadyInQueue){
        // Create a room with the two users

        const otherUserSocket = usersWaitingForRandomMatch[indexOfMatch].socket;
        const roomId = userMatchDetailsObject.userMatchCode;

        const user1Name = userMatchDetailsObject.username;
        const user2Name = usersWaitingForRandomMatch[indexOfMatch].userMatchDetailsObject.username;
        const songOption = userMatchDetailsObject.option;

        //create a room data object 
        roomDataObjects.push({
          roomId: roomId, 
          user1: user1Name,
          user2: user2Name,
          audio1: '',
          audio2: ''
        });

        socket.join(roomId);
        otherUserSocket.join(roomId);
        let gameUserData = {
          option: songOption,
          user1: userMatchDetailsObject.username,
          user2: usersWaitingForRandomMatch[indexOfMatch].userMatchDetailsObject.username
        }
        // put them both in the room
        // remove them from users Searching
        usersWaitingForRandomMatch.splice(indexOfMatch,1);
        // emit the event so that the GameMode component knows to load
        io.to(roomId).emit('startSingingMatch', gameUserData);
        console.log("Successfully Joined a Random Match Room!");
      } else {
        if (imAlreadyInQueue){
          // remove me from the queue THEN push my new userJoinObject
          usersWaitingForRandomMatch.splice(indexOfMatch,1);
        }
        // contains the socket AND the details of song etc;
        usersWaitingForRandomMatch.push(userJoinObject);
      }
    });

    socket.on('joinGameModeMatch', (room) => {
      const gameId = room.gameId;

      socket.join(gameId);
      console.log(gameId);
      socket.room = gameId;
    });

    socket.on('waitForCodeMatch', (userMatchDetailsObject) => {
      // user is waiting here for a specific user to find them by their
      console.log('waitForCodeMatch');
      const userJoinObject = {"socket": socket, "userMatchDetailsObject": userMatchDetailsObject };
      usersWaitingForCodeMatch.push(userJoinObject);
    });

    socket.on('findCodeMatch', (userMatchDetailsObject) => {
      // this will take the input match code and search for 
      // the matching code in the 'waiting room'
      const userJoinObject = {"socket": socket, "userMatchDetailsObject": userMatchDetailsObject };
      console.log('FINDING UserCodeMatch');
      console.log(JSON.stringify(userMatchDetailsObject));

      const indexOfMatch = usersWaitingForCodeMatch.findIndex(userWaiting => userWaiting.userMatchDetailsObject.userMatchCode === userMatchDetailsObject.waitingUserMatchCode)
      console.log("index of match: " + indexOfMatch);
      if (indexOfMatch > -1){
        // Create a room with the two users

        let otherUserSocket = usersWaitingForCodeMatch[indexOfMatch].socket;
        let roomId = userMatchDetailsObject.waitingUserMatchCode;
        socket.join(roomId);
        otherUserSocket.join(roomId);


        let gameUserData = {
          option: userMatchDetailsObject.option,
          user1: userMatchDetailsObject.username,
          user2: usersWaitingForCodeMatch[indexOfMatch].userMatchDetailsObject.username
        }
        // put them both in the room
        // remove them from users Searching
        usersWaitingForCodeMatch.splice(indexOfMatch,1);
        // we also want to remove this user that input the code
        // because they were previously autoAdded:
        let myIndex = usersWaitingForCodeMatch.findIndex(userWaiting => userWaiting.userMatchDetailsObject.userMatchCode === userMatchDetailsObject.myMatchCode);
        if (myIndex > -1){
          usersWaitingForCodeMatch.splice(myIndex,1);
        };

        // emit the event so that the GameMode component knows to load
        io.to(roomId).emit('startSingingMatch', gameUserData);
        console.log("Successfully Joined a Code Match Room!");

      } else {
        let reconstructUserMatchObject = { 
          username:  userMatchDetailsObject.username,
          option: userMatchDetailsObject.option,
          userMatchCode: userMatchDetailsObject.myMatchCode
        };
        const remadeJoinObject = {"socket": socket, "userMatchDetailsObject": reconstructUserMatchObject };
        // this means the code they put in didn't work
        // user should double check the code, and also ask the other user to try inputting their code
        usersWaitingForCodeMatch.push(remadeJoinObject);
        // push them to the queue so that if their partner then tries to search for their code that is being displayed, they can still get matched
      }
    });

    socket.on('userFileReady', (userAudioFiles) => {
      // put the incoming one in the object for storage
      // if this is the first one just put it there and wait for results
      let [, currentRoom] = socket.rooms; // Set object
      console.log('currentRoom: ', currentRoom);
      console.log('roomDataObjects: ', roomDataObjects);
      // TODO the roomDataObjects is not being updated

      if (roomDataObjects !== undefined && roomDataObjects?.length !== 0) {
        console.log('shouldbetrue: ', roomDataObjects[0].roomId == currentRoom);
        const currentRoomIndex = roomDataObjects.findIndex((room) => room.roomId == currentRoom );
        console.log('currentRoomIndex: ', currentRoomIndex);
        let sourceData = roomDataObjects[currentRoomIndex];
        console.log('sourceData: ', sourceData);
        if (sourceData !== undefined){
          let isUser1 = sourceData?.user1 == userAudioFiles?.user1;
          console.log('isUser1: ', isUser1);
          console.log('userAudioFiles?.audio1: ', userAudioFiles?.audio1);
          console.log('sourceData: ', sourceData);

          if (isUser1 == true) {
            sourceData.audio1 = userAudioFiles?.audio1;
          } else {
            sourceData.audio2 = userAudioFiles?.audio1; 
          }
          if (sourceData.audio1 !== '' && sourceData.audio2 !== ''){
            console.log('before sending sourceData: ', sourceData)
            // clients are ready to receive the data back and analyze
            io.in(currentRoom).emit('userAudioFilesReady', sourceData);
            // then remove the data from the 'datastore' array
            // TODO add this in when calls are perfected
            // roomDataObjects.splice(currentRoomIndex, 1);
          } else {
            // update the data with updated audio
            // and wait for the other user to submit theirs
            roomDataObjects[currentRoomIndex] = sourceData;
          }
        }
      }
    })

    socket.on('startReady', () => {
      // Make sure that we have received from 2 players
      // receive this from both players to know if they are ready
      // then emit
      // startSingingMatch event
      room.emit('startSingingMatch');
      console.log("TEST SUCCESSFUL");
    });


    socket.on('joinGameLobby', (room) => {
        const gameId = room.gameId;

        socket.join(gameId);
        console.log(gameId);
        socket.room = gameId;

        if (numClients[gameId] === undefined) {
            numClients[gameId] = 1;
        }
        else {
            numClients[gameId]++;
        }

        if (clientNames[gameId] === undefined) {
            clientNames[gameId] = [];
        }
        
        clientNames[gameId].push(room.username)
        
        console.log(clientNames[gameId]);

    });

    socket.on("shouldGameStart", (gameId) => {
        console.log(numClients[gameId]);
        if (numClients[gameId] === 2) {
            io.in(gameId).emit("start game", clientNames[gameId]);
            io.in(gameId).emit('message', { text: "Welcome to Online Chess!", user: "admin" });
        }

        if (numClients[gameId] > 2) {
            console.log("room full :(");
        }
    });

    socket.on('move', (state) => {
        io.in(state.gameId).emit('userMove', state); 
    });

    socket.on('castle', (data) => {
        io.in(data.gameId).emit('castleBoard', data);
    });

    socket.on("rematch", (data) => {
        rematchCounter += data.num;
        console.log("rematch counter " + rematchCounter);
        if (rematchCounter === 2) {
            rematchCounter = 0;
            io.in(data.gameId).emit("initiateRematch")
        }
    });

    socket.on("clickResign", (data) => {
        console.log("user clicked resign");
        io.in(data.gameId).emit("initiateResign");
    });

    socket.on("enPassant", (data) => {
        io.in(data.gameId).emit("handleEnpassant", data);
    })

    //messaging chat
    socket.on("sendMessage", (message, gameId, username, callback) => {
        io.in(gameId).emit('message', { text: message, user: username })
        callback();
    });

    //video chat
    socket.on("callUser", (data) => {
        io.in(data.gameId).emit("hello", { signal: data.signalData, from: data.from })
    });

    socket.on('acceptCall', (data) => {
        io.in(data.gameId).emit("callAccepted", data.signal);
    });
})

server.listen(HTTP_PORT, () => {
    console.log(`listening on port ${HTTP_PORT}`);
})