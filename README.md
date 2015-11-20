# score-machine

Module for chat, which assessing users behavior and rewards/penalizes

## Classes description

* **machinist** - module for processing user messages and triggering appropriate ChatSide behavior methods in accordance to message types
* **jury** - modules to assess user's behavior
 * **termination** - penalizes for improper dialog termination
 * **vegetability** - penalizes for inactivity
* **user** - classes for users involved in chat
 * **Accumulator** - to keep user's score for some dialog with ability to display "delta" for last period
 * **ChatSide** - represents participant of a chat. Since user may participate several chats, he may have few ChatSide instances at a time.
 * **Honor** - honor of user is collected for all of his dialogs and saved in persistent storage
 * **UserSession** - session of user provides access to events emitter (socket.io) and user's persistent storage
* config.json - configuration of module
* test/ - automated testing of dialog scenarios
