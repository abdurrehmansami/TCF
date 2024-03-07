import { useState } from 'react';
import { CPagination } from '@coreui/react'

function CorePagination({ totalPages, parentCallback }) {

  const [page, setPage] = useState(1);

  const handlePageChange = (value) => {
    setPage(value);
    parentCallback(value);
  };

  {
    return totalPages > 1 && (
      <div className={'mt-2'} >
        <CPagination
          activePage={page}
          pages={totalPages}
          onActivePageChange={(i) => handlePageChange(i)}
        ></CPagination>
      </div>
    )
  }
}

export default CorePagination;