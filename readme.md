# Space Invaders

Enemy ships are controlled using a game loop. The game loop is implemented using a recursive function that waits a set period of time to call itself again. The time is controlled through the resolving of a Promise.

As the enemy ships move down the board, the time between calls is shortened. Producing faster moving ships.
