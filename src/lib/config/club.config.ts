const config = {
  club: {
    default: {
      name: "Club",
      description: "Empty club description",
      image: "/images/default-club-image.png",
      linktree: "",
    },
    max: {
      name: 50,
      description: 100,
      linktree: 100,
    },
    min: {
      name: 1,
      description: 1,
      linktree: 1,
    },
  },
  initiative: {
    default: {
      name: "New Initiative",
      description: "Empty initiative description",
      image: "/images/default-initiative-image.png",
    },
    max: {
      name: 50,
      description: 100,
    },
    min: {
      name: 1,
      description: 1,
    },
  },
};

export default config;
