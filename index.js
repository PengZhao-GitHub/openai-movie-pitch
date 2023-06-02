import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'

const setupTextarea = document.getElementById('setup-textarea')
const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

document.getElementById("send-btn").addEventListener("click", () => {
  if (setupTextarea.value) {
    const userInput = setupTextarea.value
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchBotReply(userInput)
    fetchSynopsis(userInput)
  }

})

async function fetchBotReply(outline) {
  console.log(outline)
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    //prompt: `Generate a short message to enthusiastically say "${outline}" sounds interesting and that you need some minutes to think about it. Mention one aspect of the sentence.`,
    prompt: `Generate a short message to enthusiastically say an outline sounds interesting and that you need some minutes to think about it.
    ###
    outline: Two dogs fall in love and move to Hawaii to learn to surf.
    message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
    ###
    outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
    message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
    ###
    outline: A group of corrupt lawyers try to send an innocent woman to jail.
    message: Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
    ###
    outline: ${outline}
    message: 
    `,
    max_tokens: 60 //default to 16, 100 tokens is about 75 words
  })
  movieBossText.innerText = response.data.choices[0].text.trim()
  console.log(response)
}

async function fetchSynopsis(outline) {
  /*
  Challenge:
    1. Set up an API call with model, prompt, and max_tokens properties.
    2. The prompt should ask for a synopsis for a movie based on the 
      outline supplied by the user.
  */

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    //'prompt': `Generate an engagin, professional and marketable movie synopsis based on the following idea: ${outline}" `,
    prompt: `Generate an engaging, professional and marketable movie synopsis based on an outline. The synopsis should include actors names in brackets after each character. Choose actors that would be ideal for this role.
              ###
              outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
              synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
              ###
              outline: ${outline}
              synopsis: 
              `,
    max_tokens: 700
  })

  const synopsis = response.data.choices[0].text.trim()
  document.getElementById('output-text').innerText = synopsis

  // const outputContainer = document.getElementsByClassName('output-container')[0]
  // outputContainer.style.display = "block"

  fetchTitle(synopsis)
  fetchStars(synopsis)
}




async function fetchTitle(synopsis) {
  /*
  Challenge:
  1. Write a prompt asking for a title based on a synopsis. 
   You can specify that the title should be gripping, or flashy, 
   or alluring if you would like. 
  2. Add 'model' and 'max_tokens' properties. 
  */

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    //'prompt': `Generate an engagin, professional and marketable movie synopsis based on the following idea: ${outline}" `,
    prompt: `Generate a attracting and marketable movie title based on the ${synopsis}`,
    max_tokens: 25,
    temperature: 0.7
  })

  const title = response.data.choices[0].text.trim()
  document.getElementById('output-title').innerText = title
  fetchImagePromt(title, synopsis)

}

async function fetchStars(synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    /*
    Challenge:
        1. Use OpenAI to extra the names in brackets from our synopsis.
    */
    //prompt: `Extract the actors names in brackets after each character in the ${synopsis}, and list them in one line`,
    prompt: `Extract the names in brackets from the synopsis.
    ###
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    names: Tom Cruise, Val Kilmer, Kelly McGillis
    ###
    synopsis: ${synopsis}
    names:   
    `,
    max_tokens: 30
  })
  document.getElementById('output-stars').innerText = response.data.choices[0].text.trim()
}

async function fetchImagePromt(title, synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    /*
    Challenge:
    1. Write a prompt that will generate an image prompt that we can 
       use to get artwork for our movie idea.
    ⚠️ OpenAI has no knowledge of our characters. So the image prompt 
       needs descriptions not names!
    2. Add temperature if you think it's needed.
    */
    // Added by Peng, two samples may be enough
    prompt: `Give a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual detail but contain no names.
    ###
    title: Love's Time Warp
    synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
    image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is super-imposed over the scene.
    ###
    title: zero Earth
    synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
    image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
    ###
    title: Animal Revolution
    synopsis: In a world gone mad, Dr. Victor Drazen (Daniel Craig) has invented a machine that can control the minds of all humans. With the fate of humanity at stake, an unlikely group of intelligent animals must take on the challenge of stopping Drazen and his evil plan. Led by Golden Retriever Max (Chris Pratt) and his best friend, the wise-cracking squirrel Scooter (Will Arnett), they enlist the help of a street-smart raccoon named Rocky (Anna Kendrick) and a brave hawk named Talon (Zoe Saldana). Together, they must find a way to stop Drazen before he can enslave humanity.
    image description:  A group of animals, led by a golden retriever, standing in a defensive line in a dark alley. The animals are silhouetted against a backdrop of a towering city skyline, with a full moon in the sky above them. Sparks are flying from the claws of the hawk in the center of the group, and the raccoon is brandishing a makeshift weapon.
    ###
    title: ${title}
    synopsis: ${synopsis}
    image description: 
    `,
    temperature: 0.8,
    max_tokens: 100
  })

  fetchImageUrl(response.data.choices[0].text.trim())
}

async function fetchImageUrl(imagePrompt) {
  /*
  Challenge:
  1. Use the imagePrompt to generate an image.
     - The image should be 512x512 pixels in size.
     - We only want one image.
     - We want to get a url. 
     
     Think about what properties you need to put in the object 
     you pass to OpenAI.
     ⚠️ If you find a lot of garbled text in your images, you could 
     specifically request an image with no text. 
  */

  const response = await openai.createImage({
    prompt: imagePrompt,
    n: 1,
    size: '512x512',
    response_format: 'url'
  })


  document.getElementById('output-img-container').innerHTML = `<img src="${response.data.data[0].url}">`

  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  document.getElementById('view-pitch-btn').addEventListener('click', () => {
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'

  })

}

