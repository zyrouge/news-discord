module.exports = {
  title: "News Bot",
  name: "news_bot",
  description: "Incidents about News Bot will be posted here.",
  defaultLocale: "en",
  locales: [
    {
      code: "en",
      iso: "en-US",
      name: "English",
      file: "en.json"
    }
  ],
  content: {
    frontMatterFormat: "yaml",
    systems: ["bot", "web", "api"]
  }
}