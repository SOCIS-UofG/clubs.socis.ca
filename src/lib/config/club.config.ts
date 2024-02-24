const config = {
  club: {
    default: {
      name: "Club",
      description: "Empty club description",
      location: "No location provided",
      image: "/images/default-club-image.png",
      events: [],
      members: [],
    },
    max: {
      name: 50,
      description: 100,
      location: 50,
      date: 50,
    },
    min: {
      name: 1,
      description: 1,
      location: 1,
      date: 1,
    },
  },
};

export default config;
