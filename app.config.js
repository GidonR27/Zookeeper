module.exports = {
  name: "Zoo Keeper",
  slug: "zoo-keeper",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/favicon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/favicon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  web: {
    bundler: "metro",
    output: "static"
  },
  extra: {
    eas: {
      projectId: "zoo-keeper"
    }
  }
}; 