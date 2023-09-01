#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const path = require('path');
const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
}); 

const game = () => {
    const num = Math.round(Math.random()*2);
    rl.question('Угадай орел(1) или решка(2)... \n', (data) => {
        if ([1,2].includes(Number(data))) {
            if(Number(data) === num) {
                console.log('You won');
                writeLog('victory');
            } else {
                console.log('You lose');
                writeLog('defeat');
            }
        } else {
            console.log('Ответом может быть только число 1 или 2');
        }
        rl.question('Сыграем еще (y - да, n - нет)? \n', (data) => {
            restart(data);
        });
    })
};

const restart = (data) => {
    if (data.toLowerCase() === 'y') {
        game();
    } else if (data.toLowerCase() === 'n') {
        rl.close();
    } else {
        console.log('Введите корректное значение');
        rl.on('line', (input) => {
            restart(input);
        });
    }
};

const writeLog = (logName) => {
    try{
        const filePath = process.argv[4];
        console.log(filePath);
        const dirStat = path.join(__dirname, filePath);
        if (fs.existsSync(`${dirStat}.txt`)) {
            fs.readFile(
                `${dirStat}.txt`,
                'utf-8',
                (error, data) => {
                    if( error) throw error;
                    const statistics = JSON.parse(data);
                    if (logName === 'victory') {
                        statistics.victory++;
                    } else if (logName === 'defeat'){
                        statistics.defeat++;
                    }
                    statistics.countGames++;
                    fs.writeFile(
                        `${dirStat}.txt`,
                        JSON.stringify(statistics),
                        (error) => {
                            if (error) throw error;
                        }
                    );
                }
            );
        } else {
            const statistics = {
                countGames: 0,
                victory: 0,
                defeat: 0
            }
            fs.writeFile(
                `${dirStat}.txt`,
                JSON.stringify(statistics),
                (error) => {
                    if (error) throw error;
                }
            );
            writeLog(logName);
        }
    } catch (e) {
        console.error(e);
    }
}

const statistics = () => {
    try{
        const filePath = process.argv[4];
        if (fs.existsSync(`${filePath}.txt`)) {
            const readStream = fs.createReadStream(`${filePath}.txt`);
            readStream
                .setEncoding('utf8')
                .on('data', (data) => {
                    const statistics = JSON.parse(data);
                    const winRate = Math.round((statistics.victory * 100) / statistics.countGames)
                    console.log(
                        `Игр всего: ${statistics.countGames}\n
                        Побед: ${statistics.victory}\n
                        Поражений: ${statistics.defeat}\n
                        Процент побед : ${winRate}\n`
                    )
                })
                .on('end', () => {
                    console.log('Bye Bye');
                })
                .on('error', (error) => {
                    throw error;
                })
        } else {
            console.log('Файл не найден');
        }
    } catch (e) {
        console.error(e);
    }
}

const options = yargs => {
    return yargs
      .option(
        'file',
      {
        alias: 'f',
        nargs: 1,
        demandOption: true,
        type: 'string',
        description: '<file> filename'
      })
  };

const argv = yargs(hideBin(process.argv))
    .command({
        command: 'game',
        aliases: 'g',
        desc: 'game with log',
        builder: options,
        handler: game,
    })
    .command({
        command: 'statistics',
        aliases: 's',
        desc: 'statistics results of game',
        builder: options,
        handler: statistics,
    })
    .demandCommand(1, 1, 'You need at least one command before moving on')
    .strict()
    .help()
    .argv;





