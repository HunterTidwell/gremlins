# gremlins
Exploration of the gremlins puzzle on arbitrary graphs

The puzzle goes like this.
5 houses on a straight road. One house has a gremlen; you don't know which.
Each day, you can check one house and you are guaranteed to find the gremlin if he's there.
Each night, the gremlin must move to an adjacent house to where it was that day.
Can you find the gremlin? Can you do it in 6 days?

The more general puzzle, which you can explore here, is on an arbitrary graph of house connections.
Build a graph by first placing houses in "place houses" mode.
Then use "place roads" to select pairs of houses which are connected.
By default, houses contain a green dot, indicating the possible presence of a gremlin.
You can enter "remove gremlins" mode to simulate checking a house, removing the possibility of a gremlin there.

Then we have the option to "duplicate gremlins." This simulates a night passing.
After each night passes, the gremlin must have moved along 1 edge of the graph.
So, each house that may have contained a gremlin (has a green circle) "duplicates" its green circle and places it in every neighboring house instead.

The "autoduplicate" mode guarantees that a night passes after each day when you check a house/remove a gremlin.

