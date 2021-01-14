//importing the libraries
const Discord = require('discord.js')
const puppeteer = require('puppeteer')
const env = require('dotenv').config().parsed
const client = new Discord.Client


//client ready EventListenner
client.on('ready',()=>{
    console.log(`logged in with the user ${client.user.tag}`)
})

let currentServers = ['official','creative','mini']
let data_ids = [env.OFFICIAL,env.CREATIVE,env.MINI]
let ips = [env.OFFIP,env.CREAIP,env.MINIP]

//client on recieving a message event listenner
client.on('message',(message)=>{
    //classifying bot and non bot messges
    let content = message.content
    let splited = content.split(' ')
    if(message.author.bot == true){

    }else{
        //commands section

        //filtering the messages
        if(splited[0]=='!inventcraft'){
            if(splited.length==3){
                if(currentServers.includes(splited[1])==true){
                    let dataid = data_ids[currentServers.indexOf(splited[1])]
                    let ip = ips[currentServers.indexOf(splited[1])]
                    if(splited[2]=='ip'){
                        let ipEmbed = new Discord.MessageEmbed()
                            .setColor('')
                            .setTitle('Inventcraft'+splited[1])
                            .setDescription('ip : `'+ip+'`')
                        message.channel.send(ipEmbed)
                    }else if(splited[2]=='status'){
                        let waitEmbed = new Discord.MessageEmbed()
                            .setColor('#0040ff')
                            .setTitle('Plz Wait...');
                        message.channel.send(waitEmbed);
                        (async () => {
                            const browser = await puppeteer.launch({headless:true});
                            const page = await browser.newPage();
                            await page.goto('https://aternos.org/go/');
                            await page.waitForSelector('input#user')
                            await page.type('input#user',env.USER)
                            await page.type('input#password',env.PASSWORD)
                            await page.click('div#login')
                            await page.waitForSelector('[data-id="'+dataid+'"]')
                            await page.click('[data-id="'+dataid+'"]')
                            await page.waitForSelector('[class="statuslabel-label"]')
                            let queTime;
                            let status = await page.$eval('[class="statuslabel-label"]',el => el.innerText)
                            if(status == 'Waiting in queue'){
                                queTime = await page.$eval('[class="server-status-label-left queue-time"]',el => el.innerText) 
                            }
                            if(status=='Online'){
                                queTime = await page.$eval('#players',el => el.innerText)
                            }
                            statusMessage(message,status,queTime)
                            browser.close()
                        })();
                    }else if(splited[2]=='info'){
                        let waitEmbed = new Discord.MessageEmbed()
                            .setColor('#0040ff')
                            .setTitle('Plz Wait...');
                        message.channel.send(waitEmbed);
                        (async () => {
                            const browser = await puppeteer.launch({headless:true})
                            const page = await browser.newPage()
                            await page.goto('https://aternos.org/go/');
                            await page.waitForSelector('input#user')
                            await page.type('input#user',env.USER)
                            await page.type('input#password',env.PASSWORD)
                            await page.click('div#login')
                            await page.waitForSelector('[data-id="'+dataid+'"]')
                            await page.click('[data-id="'+dataid+'"]')
                            await page.waitForSelector('[class="statuslabel-label"]')
                            let software = await page.$eval('#software',el=>el.innerText)
                            let version = await page.$eval('#version',el=>el.innerText)
                            let maxPlayers = (await page.$eval('#players',el=>el.innerText)).split('/')[1]
                            await page.goto('https://aternos.org/players/ops')
                            let ops = await page.evaluate(()=>{
                                let eleObjects = document.querySelectorAll('.list-name')
                                let deops = []
                                eleObjects.forEach(ele => deops.push(ele.innerText))
                                return deops
                            })
                            browser.close()
                            let infoEmbed = new Discord.MessageEmbed()
                                .setColor('#ff1a1a')
                                .setTitle(ips[currentServers.indexOf(splited[1])])
                                .setDescription(`maxPlayers : ${'`'+maxPlayers+'`'}
                                software : ${'`'+software+'`'}
                                version : ${'`'+version+'`'}
                                op players : ${'`'+ops.join(' ,')}`+'`')
                            message.channel.send(infoEmbed)
                        })()
                    }else{
                        let NoActions = new Discord.MessageEmbed()
                            .setColor('#ff1a1a')
                            .setTitle('Wrong Argument')
                            .setDescription('The Action that u mentioned in the command is incorrect, plz fix it and try it again.')
                        message.channel.send(NoActions)
                    }
                }else{
                    let wrongName = new Discord.MessageEmbed()
                        .setColor('#ff1a1a')
                        .setTitle('Wrong Name!')
                        .setDescription('The name of the server u entered was wrong - '+'`'+splited[1]+'`'+' where as all the valid names right now are '+currentServers.join(' ,'))
                    message.channel.send(wrongName)
                }
            }else{
                let TooManyArgs = new Discord.MessageEmbed()
                    .setColor('#ff1a1a')
                    .setTitle('Wrong Number Of Arguments')
                    .setDescription('The number of Arguments in your command were '+splited.length+' where as the command have 3 arguments as follows: `!inventcraft` `<servername>` `<action>`')
                message.channel.send(TooManyArgs)
            }
        }
    }
})

let statuses = ['Online','Offline','Waiting in queue']
let colors = ['#40ff00','#ff0000','#ff8000']

function statusMessage(message,status,que){
    let color;
    if(statuses.includes(status)==true){
        color = colors[statuses.indexOf(status)]
    }else{
        color = '#808080'
    }
    let statuseEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle('InventCraft'+message.content.split(' ')[1]+' is currently '+status)
    if(que!=undefined){
        statuseEmbed.setDescription('Online Players : `'+que+'`')
    }
    message.channel.send(statuseEmbed)
}

client.login(env.BOT_TOKEN)