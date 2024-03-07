import { React, useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import useFetch from "src/hooks/useFetch";
import { getData } from "../services/NetworkService";
import { useTranslation } from "react-i18next";
import { EmailOutlined } from "@material-ui/icons";
import { Badge, Dropdown, Space } from "antd";

const TheHeaderDropdownMssg = () => {
  const history = useHistory();
  const { data: user } = useFetch("employeeprofile");
  const { data: noti } = useFetch("notifications?size=1000");
  const [notifications, setNotifications] = useState(null);
  const [allNotifications, setAllNotifications] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (noti && noti.data) {
      noti.data.content.sort(function (a, b) {
        return b.createdOn - a.createdOn;
      });
      setPartialNotis(noti.data.content);
      var sse = new EventSource(
        `${process.env.REACT_APP_SERVER_URL}notifications/sse`,
        { withCredentials: true }
      );
      sse.onmessage = function (evt) {
        getData("notifications?size=1000").then((res) => {
          res.data.data.content.sort(function (a, b) {
            return b.createdOn - a.createdOn;
          });
          setPartialNotis(res.data.data.content);
        });
      };
      sse.onclose = function () {
        console.log("closed");
      };
      sse.onerror = function () {
        console.log("error");
      };

      return () => {
        sse.close();
      };
    }
  }, [noti]);

  const setPartialNotis = (notis) => {
    console.log("called:" + notis.length);
    setAllNotifications(notis);
    setNotifications(notis.length > 10 ? notis.slice(0, 10) : notis);
  };

  return (
    <Dropdown
      menu={{
        items:
          notifications?.map((o) => ({
            label: o.message,
          })) || [],
      }}
      trigger={["click"]}
    >
      <span>
        <Badge count={allNotifications?.length || 0}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <EmailOutlined />
            </Space>
          </a>
        </Badge>
      </span>
    </Dropdown>
    // <CDropdown inNav className="c-header-nav-item mx-2" direction="down">
    //   <CDropdownToggle className="c-header-nav-link" caret={false}>
    //     <EmailOutlined />
    //     {allNotifications && allNotifications.length > 0 && (
    //       <CBadge shape="pill" color="info">
    //         {allNotifications.length}
    //       </CBadge>
    //     )}
    //   </CDropdownToggle>
    //   {notifications && (
    //     <>
    //       <CDropdownMenu className="pt-0" placement="bottom-end">
    //         <CDropdownItem header tag="div" color="light">
    //           <strong>
    //             {t("notification count", { count: allNotifications.length })}
    //           </strong>
    //           {allNotifications.length > 0 && (
    //             <div
    //               style={{ float: "right", cursor: "pointer" }}
    //               onClick={() => {
    //                 notifications.forEach((xx) => {
    //                   xx.opened = true;
    //                   putData(`notifications/${xx.id}`, xx);
    //                 });
    //                 setPartialNotis(
    //                   allNotifications.length > 10
    //                     ? allNotifications.slice(10)
    //                     : []
    //                 );
    //               }}
    //             >
    //               {t("clear all")}
    //             </div>
    //           )}
    //         </CDropdownItem>
    //         {notifications.map((o) => {
    //           return (
    //             <>
    //               <CDropdownItem
    //                 href={o.link}
    //                 style={{ margin: "0 20px 0 0px" }}
    //                 onClick={() => openNotification(o)}
    //               >
    //                 <div className="message">
    //                   {/*<div className="pt-3 mr-3 float-left">
    //                     <div className="c-avatar">
    //                       {user && <CImg
    //                         src={'/avatars/7.jpg'}
    //                         className="c-avatar-img"
    //                         alt={user.fullname}
    //                       />}
    //                       <span className="c-avatar-status bg-success"></span>
    //                     </div>
    //                   </div>*/}
    //                   {/*<div>
    //                     <small className="text-muted">John Doe</small>
    //                     <small className="text-muted float-right mt-1">Just now</small>
    //                   </div>*/}
    //                   <div className="text-truncate font-weight-bold">
    //                     <span className="fa fa-exclamation text-danger"></span>
    //                     {o.title}
    //                   </div>
    //                   <div className="small text-muted text-truncate">
    //                     {o.message} |{" "}
    //                     {moment(o.createdOn).format("DD/MM/YY hh:mm")}
    //                   </div>
    //                 </div>
    //               </CDropdownItem>
    //               {/* <div className="message small text-muted text-truncate" style={{float:'right', cursor:'pointer', margin:'-27px 20px 0 0', 'zIndex':10000}}
    //                      onClick={(e) =>  {
    //                                         o.opened = true
    //                                         putData(`notifications/${o.id}`, o)
    //                                           .then(res => {
    //                                               setPartialNotis(allNotifications.filter(n => n.id !== o.id))
    //                                           })
    //                                     }
    //                              }
    //               >
    //                  {t('close')}
    //              </div> */}
    //             </>
    //           );
    //         })}
    //         {/*<CDropdownItem href="#" className="text-center border-top"><strong>View all messages</strong></CDropdownItem>*/}
    //         {allNotifications.length > 10 && (
    //           <div
    //             align="center"
    //             className="message small text-muted text-truncate"
    //           >
    //             {t("noti showing records", {
    //               partial: notifications.length,
    //               total: allNotifications.length,
    //             })}
    //           </div>
    //         )}
    //       </CDropdownMenu>
    //     </>
    //   )}
    // </CDropdown>
  );
};

export default TheHeaderDropdownMssg;
