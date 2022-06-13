#![allow(dead_code)]

use std::path::Path;
use std::fs::File;
use std::io::{ Write, BufReader, BufRead };

use serde::{Deserialize, Serialize};

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
struct Blackcard {
    #[serde(skip_serializing)]
    id: u32,
    draw: u32,
    pick: u32,
    text: String,
    watermark: String,
}

impl Blackcard {
    fn parse(line: &String) -> Self {
        let mut split = line.split("\t");

        let id = split.next().unwrap();
        let id = id.parse::<u32>()
            .expect("Failed to parse u32");

        let draw = split.next().unwrap();
        let draw = draw.parse::<u32>()
            .expect("Failed to parse u32");

        let pick = split.next().unwrap();
        let pick = pick.parse::<u32>()
            .expect("Failed to parse u32");

        let text = split.next().unwrap();
        let text = text.to_string();

        let watermark = split.next().unwrap();
        let watermark = watermark.to_string();

        Self {
            id,
            draw,
            pick,
            text,
            watermark,
        }
    }

    fn parse_all(lines: &Vec<String>) -> Vec<Self> {
        let (starting_line, ending_line) = 
            parse_range(lines, "COPY black_cards", "\\.");

        let mut result = Vec::new();
        for i in starting_line..ending_line {
            let card = Self::parse(&lines[i]);
            result.push(card);
        }

        result
    }
}

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
struct Whitecard {
    #[serde(skip_serializing)]
    id: u32,
    text: String,
    watermark: String,
}

impl Whitecard {
    fn parse(line: &String) -> Self {
        let mut split = line.split("\t");

        let id = split.next().unwrap();
        let id = id.parse::<u32>()
            .expect("Failed to parse u32");

        let text = split.next().unwrap();
        let text = text.to_string();

        let watermark = split.next().unwrap();
        let watermark = watermark.to_string();

        Self {
            id,
            text,
            watermark,
        }
    }

    fn parse_all(lines: &Vec<String>) -> Vec<Self> {
        let (starting_line, ending_line) = 
            parse_range(lines, "COPY white_cards", "\\.");

        let mut result = Vec::new();
        for i in starting_line..ending_line {
            let card = Self::parse(&lines[i]);
            result.push(card);
        }

        result
    }
}

#[derive(Debug, Deserialize, Serialize)]
struct CardPack {
    #[serde(skip_serializing)]
    id: u32,
    name: String,

    black_cards: Vec<Blackcard>,
    white_cards: Vec<Whitecard>,
}

impl CardPack {
    fn new(id: u32, name: String) -> Self {
        Self {
            id,
            name,

            black_cards: Vec::new(),
            white_cards: Vec::new(),
        }
    }

    fn parse(lines: &Vec<String>) -> Vec<CardPack> {
        let range = parse_range(&lines, "COPY card_set", "\\.");

        let mut card_packs = Vec::new();
        for i in range.0..range.1 {
            let mut split = lines[i].split("\t");

            let parse_bool = |s| {
                return if s == "t" { 
                    true 
                } else if s == "f" { 
                    false 
                } else { 
                    panic!("Unknown symbol '{}' for boolean parsing", s) 
                };
            };

            let id = split.next().unwrap();
            let id = id.parse::<u32>()
                .expect("Failed to parse u32");

            let active = split.next().unwrap();
            let _active = parse_bool(active);

            let base_deck = split.next().unwrap();
            let _base_deck = parse_bool(base_deck);

            let desc = split.next().unwrap();
            let _desc = desc.to_string();

            let name = split.next().unwrap();
            let name = name.to_string();

            let weight = split.next().unwrap();
            let _weight = weight.parse::<u32>()
                .expect("Failed to parse u32");

            
            card_packs.push(CardPack::new(id, name));
        }

        let black_cards = Blackcard::parse_all(&lines);
        let white_cards = Whitecard::parse_all(&lines);

        let find_black_card_with_id = |id| {
            for card in &black_cards {
                if card.id == id {
                    return Some(card.clone());
                }
            }

            return None;
        };

        let find_white_card_with_id = |id| {
            for card in &white_cards {
                if card.id == id {
                    return Some(card.clone());
                }
            }

            return None;
        };

        let range = parse_range(&lines, "COPY card_set_black_card", "\\.");
        for i in range.0..range.1 {
            let mut split = lines[i].split("\t");

            let card_pack_id = split.next().unwrap();
            let card_pack_id = card_pack_id.parse::<u32>()
                .expect("Failed to parse u32");

            let black_card_id = split.next().unwrap();
            let black_card_id = black_card_id.parse::<u32>()
                .expect("Failed to parse u32");

            let mut index = None;
            for i in 0..card_packs.len() {
                if card_packs[i].id == card_pack_id {
                    index = Some(i);
                }
            }

            let pack_index = index.unwrap();
            let card = find_black_card_with_id(black_card_id)
                .expect("Wrong");

            card_packs[pack_index].black_cards.push(card);
        }

        let range = parse_range(&lines, "COPY card_set_white_card", "\\.");
        for i in range.0..range.1 {
            let mut split = lines[i].split("\t");

            let card_pack_id = split.next().unwrap();
            let card_pack_id = card_pack_id.parse::<u32>()
                .expect("Failed to parse u32");

            let white_card_id = split.next().unwrap();
            let white_card_id = white_card_id.parse::<u32>()
                .expect("Failed to parse u32");

            let mut index = None;
            for i in 0..card_packs.len() {
                if card_packs[i].id == card_pack_id {
                    index = Some(i);
                }
            }

            let pack_index = index.unwrap();
            let card = find_white_card_with_id(white_card_id)
                .expect("Wrong");

            card_packs[pack_index].white_cards.push(card);
        }

        // println!("{:#?}", card_packs);

        card_packs
    }
}

fn read_file_lines<P>(path: P) -> Vec<String> 
    where P: AsRef<Path>
{
    let file = File::open(path)
        .expect("Failed to open file");
    
    let buffer = BufReader::new(file);
    buffer.lines().map(|l| l.expect("Failed to parse line")).collect()
}

fn write_string_to_file<P>(path: P, data: &str) 
    where P: AsRef<Path>
{
    let mut file = File::create(path)
        .expect("Failed to create file");

    file.write_all(data.as_bytes())
        .expect("Failed to write data to file");
}


fn parse_range(lines: &Vec<String>, start: &str, end: &str) -> (usize, usize) {
    let mut starting_line = None;
    let mut ending_line = None;

    for i in 0..lines.len() {
        let line = &lines[i];
        if starting_line.is_none() && line.starts_with(start) {
            starting_line = Some(i + 1);
        }

        if starting_line.is_some() && line == end {
            ending_line = Some(i);
            break;
        }
    }

    let starting_line = if let Some(i) = starting_line {
        i
    } else {
        0
    };

    let ending_line = if let Some(i) = ending_line {
        i
    } else {
        lines.len()
    };

    (starting_line, ending_line)
}

fn print_usage(program: &String) {
    println!("Usage: {} <input> <output>", program);
}

fn main() {
    let args = std::env::args().collect::<Vec<String>>();

    if args.len() < 3 {
        print_usage(&args[0]);
        return;
    }

    let input = &args[1];
    let output = &args[2];

    let lines = read_file_lines(input);

    let card_packs = CardPack::parse(&lines);

    let data = serde_json::to_string_pretty(&card_packs)
        .expect("Failed to serialize to json");

    write_string_to_file(output, &data);

    /*
    let blackcards = Blackcard::parse_all(&lines);
    let whitecards = Whitecard::parse_all(&lines);

    let mut card_pack = CardPack::new();
    card_pack.blackcards = blackcards;
    card_pack.whitecards = whitecards;

    println!("Num blackcards: {}", card_pack.blackcards.len());
    println!("Num whitecards: {}", card_pack.whitecards.len());

    let data = serde_json::to_string_pretty(&card_pack)
        .expect("Failed to serialize to json");
    write_string_to_file(output, &data);
    */
}
