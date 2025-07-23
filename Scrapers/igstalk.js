const axios = require("axios");
const cheerio = require("cheerio");


async function stalkIg(username) {
  try {
    const url = `https://media.mollygram.com/?url=${username}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
        "Referer": "https://mollygram.com/",
        "Origin": "https://mollygram.com"
      },
    });

    const { html } = response.data;
    const $ = cheerio.load(html);

    
    const profilePic = $("img").attr("src") || '';
    const name = $("h4").text().trim() || '';
    const bio = $("p.text-dark").text().trim() || '';

   
    let posts = '', followers = '', following = '';
    $(".d-flex.justify-content-around.text-center.mt-3 > div").each((_, el) => {
      const label = $(el).find("div.text-dark.small").text().trim().toLowerCase();
      const value = $(el).find("span").text().trim();

      if (label === "posts") posts = value;
      else if (label === "followers") followers = value;
      else if (label === "following") following = value;
    });

    return {
      username,
      name,
      bio,
      profilePic,
      posts,
      followers,
      following
    };

  } catch (error) {
    console.error("scrap error:", error.message);
    return null;
  }
}

module.exports = stalkIg