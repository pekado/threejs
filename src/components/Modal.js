import React, {useEffect, useState} from 'react';

function Modal({children, checkpoint, isModal}) {
  // const [data, setData] = useState({});
  // useEffect(() => {
  //   if (!url) {
  //     setData({});
  //   } else {
  //     fetchData(url);
  //   }
  // }, [url]);

  // const fetchData = async (url) => {
  //   const res = await fetch(url);
  //   const data = await res.json();
  //   setData(data);
  // };
  return (
    <>
      {isModal && (
        <div className='min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 flex justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover'>
          <div className='absolute bg-black opacity-80 inset-0 z-0'></div>
          <div className='w-56 text-center max-w-lg p-5 relative mx-auto my-auto rounded-xl shadow-lg  bg-white '>
            <h2 className='text-3xl block'>{checkpoint.item}</h2>
            <img src={checkpoint.img_url} className='object-cover h-48 w-96' />
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default Modal;
