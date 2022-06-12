# Structures

## Room (JSON)
```json
{
    "id": "",
    "name": "",
}
```
* `id` - The unique ID for the room
* `name` - The name of the room

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