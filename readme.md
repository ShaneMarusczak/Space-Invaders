#Space Invaders

Enemy ships are controlled using a game loop. The game loop is implemented using a recursive function that waits a set period of time to call itself again.

As the enemy ships move down the board, the time between calls is shorted. Producing faster moving ships.
