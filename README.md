# 웅글웅글
- [웅글웅글](#----)
    * [✔ Oongle-Oongle?](#--oongle-oongle-)
    * [✔ Key Features](#--key-features)
    * [✔ Tech Stack](#--tech-stack)
- [📝 API Documentation](#---api-documentation)
    * [✔ REST API Doc](#--rest-api-doc)
    * [✔ WebSocket Doc](#--websocket-doc)
        + [- Alarm](#--alarm)
        + [- Chat](#--chat)

## ✔ Oongle-Oongle?
채팅과 게시판을 결합한 커뮤니티 프로젝트의 Backend API 입니다.

NestJS와 WebSocket 학습을 위한 프로젝트입니다.

## ✔ Key Features
* 채팅 기능: 실시간으로 소통하고 대화할 수 있는 **1:1, 단체 채팅** 기능을 제공합니다.
* **게시판** 기능: 게시물을 작성하고 소통할 수 있는 게시판이 포함되어 있습니다.
* 익명 회원 기능: **익명으로 게시글 및 댓글을 작성**할 수 있어 더 자유로운 의견을 표현할 수 있습니다.
* 다양한 로그인 방식: **로컬** 로그인 및 **OAuth2**를 통한 로그인을 지원합니다.

## ✔ Tech Stack
* NestJS(10)
  * TypeORM
  * WebSocket, Socket.IO
  * Passport, OAuth2
* MariaDB(10.3)

# 📝 API Documentation

## ✔ REST API Doc

[API 문서는 이곳](https://stringbuckwheat.github.io/oongle-api/)을 방문해주세요!

배포하지 않은 API라 **'Try-it-out' 기능은 동작하지 않습니다.**

## ✔ WebSocket Doc

### - Alarm

 이벤트(경로)                | 핸들러                  | 설명                        | 클라이언트                                   
------------------------|----------------------|---------------------------|----------------------------------------
 join<br>`alarm/join`       | handleJoin           | 특정 사용자가 알림 소켓 방에 참여       
 comment<br>`alarm/comment` | handleCommentCreated | 새 댓글 알림                   | `socket.on("comment", callback)`으로 이벤트 수신  
 chat<br>`alarm/chat`       | handleNewChat        | 새로운 채팅방 생성 및 참여자들에게 알림 전송 | `chat`

### - Chat

이벤트(경로)  | 핸들러 | 설명                         | 클라이언트
--- | --- |-------------------|-----------------------------
join/userId<br>`chat/join/{userId}` | joinChatRoomByUserIds  | 참가자들의 PK 배열로 채팅방 조회/생성 |`chat/user/join`
join<br>`chat/join` | joinChatRoomByChatRoomId | 채팅방 PK로 채팅방 입장            |`chat/user/join`            
send<br>`chat/send` | handleMessage  | 채팅방 메시지 수신 및 클라이언트 알림                 | * `chat/receive`: 채팅방에 메시지 추가 <br>* `chat/notification`: 실시간 알림