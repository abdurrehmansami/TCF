import React from "react";
import { CFooter } from "@coreui/react";

const TheFooter = () => {
  return (
    <CFooter fixed={false}>
      {/* <div>
        <a href="https://www.caansoft.com/" target="_blank" rel="noopener noreferrer">Caansoft</a>
        <span className="ml-1">&copy; 2020 Caansoft.</span>
      </div> */}
      <div className="mfs-auto">
        <span className="mr-1">Powered by</span>
        <a
          href="https://www.caansoft.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Caansoft
        </a>
      </div>
    </CFooter>
  );
};

export default React.memo(TheFooter);
