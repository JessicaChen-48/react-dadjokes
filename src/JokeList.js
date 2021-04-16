import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";
import useLocalStorage from './useLocalStorage';

/** List of jokes. */

function JokeList({numJokesToGet}) {

  // const [jokes, setJokes] = useState([]);
  const [jokes, setJokes] = useLocalStorage('jokes', []);
  const [isLoading, setIsLoading] = useState(true)


  /* at mount, get jokes */


  useEffect(() => {
    // 
    !jokes.length ? getJokes() : setIsLoading(false);
  }, []);


  async function getJokes() {
    try {
      // load jokes one at a time, adding not-yet-seen jokes
      let j = []
      let seenJokes = new Set();

      while (j.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          j.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
        console.log("J!", j)
      }
      setJokes(j)
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }

  /* empty joke list, set to loading state, and then call getJokes */

  function generateNewJokes() {
    setJokes([])
    setIsLoading(true);
    getJokes();
  }

  /* change vote for this id by delta (+1 or -1) */

  function vote(id, delta) {
    setJokes(jokes => jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      )
    );
  }

  /* render: either loading spinner or list of sorted jokes. */

    let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
    if (isLoading) {
      return (
        <div className="loading">
          <i className="fas fa-4x fa-spinner fa-spin" />
        </div>
      )
    }

    return (
      <div className="JokeList">
        <button
          className="JokeList-getmore"
          onClick={generateNewJokes}
        >
          Get New Jokes
        </button>

        {sortedJokes.map(j => (
          <Joke
            text={j.joke}
            key={j.id}
            id={j.id}
            votes={j.votes}
            vote={vote}
          />
        ))}
      </div>
    );
};

JokeList.defaultProps = {
  numJokesToGet: 5
}

export default JokeList;
