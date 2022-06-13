# Structures

## Room (JSON)
```json
{
    "id": "",
    "name": "",
    "owner": "",
    "playerCount": 0,
    "gameStarted": false,
}
```
* `id` - The unique ID for the room
* `name` - The name of the room
* `owner` - The ID of the player owning the room
* `playerCount` - The number of players connected to the room
* `gameStarted` - Has the game started

## Player (JSON)
```json
{
    "id": "",
    "username": "",
}
```
* `id` - The unique ID for the player
* `name` - The username of the player

## Black Card (JSON)
```json
{
    "id": 0,
    "draw": 0,
    "pick": 0,
    "text": "",
    "watermark": ""
}
```
* `id` - The unique ID for the card
* `draw` - Number of extra cards to draw
* `pick` - Number of cards the players needs to play
* `text` - The text of the card
* `watermark` - The watermark of the card

## White Card (JSON)
```json
{
    "id": 0,
    "text": "",
    "watermark": ""
}
```
* `id` - The unique ID of the card 
* `text` - The text of the card
* `watermark` - The watermark of the card