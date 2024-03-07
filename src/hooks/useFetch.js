import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = (endPoint, page, size, details, id, sort, search) => {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    var url = `${process.env.REACT_APP_SERVER_URL}${endPoint}`;
    if (details && id) url = url + id;
    let hasQuery = false;
    if (page) {
      url += "?page=" + page;
      hasQuery = true;
    }
    if (size) {
      url += hasQuery ? "&size=" + size : "?size=" + size;
      hasQuery = true;
    }
    if (sort) {
      url += hasQuery ? "&sort=" + sort : "?sort=" + sort;
      hasQuery = true;
    }
    if (search) {
      url += hasQuery ? "&" + search : "?" + search;
    }
    setIsPending(true);
    axios
      .get(url, { withCredentials: true })
      .then((response) => {
        console.log(response);
        setIsPending(false);
        setData(response.data);
        setError(null);
      })
      .catch((error) => {
        console.log(error);
        setIsPending(false);
        setError(error.message);
      });
  }, [page >= 0 ? page : endPoint]);

  return { data, isPending, error, setData };
};

export default useFetch;
