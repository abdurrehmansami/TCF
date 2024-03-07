import { ChatItem, MessageBox, MessageList } from 'react-chat-elements'
import 'react-chat-elements/dist/main.css';

const ChatWidget = (props) => {

  return (<>
             <ChatItem
                avatar={'https://facebook.github.io/react/img/logo.svg'}
                alt={'Reactjs'}
                title={'Facebook'}
                subtitle={'What are you doing?'}
                date={new Date()}
                unread={0} />
         <MessageBox
             position={'left'}
             type={'photo'}
             text={'react.svg'}
             data={{
                 uri: 'https://facebook.github.io/react/img/logo.svg',
                 status: {
                     click: false,
                     loading: 0,
                 }
             }}/>
             <MessageList
                 className='message-list'
                 lockable={true}
                 toBottomHeight={'100%'}
                 dataSource={[
                     {
                                             position: 'right',
                                             type: 'text',
                                             text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
                                             date: new Date(),
                                         },
                   {
                                           position: 'right',
                                           type: 'text',
                                           text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
                                           date: new Date(),
                                       },
                   {
                                           position: 'right',
                                           type: 'text',
                                           text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
                                           date: new Date(),
                                       },

                 ]} />
             </>
         )
}


export default ChatWidget;
