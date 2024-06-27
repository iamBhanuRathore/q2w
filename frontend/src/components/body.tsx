import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ModeToggle } from "./header";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib/utils";
import axios from "axios";
import moment from "moment";
const Body = () => {
  const [screenSize, getDimension] = useState({
    dynamicWidth: window.innerWidth,
    dynamicHeight: window.innerHeight,
  });
  const setDimension = () => {
    getDimension({
      dynamicWidth: window.innerWidth,
      dynamicHeight: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", setDimension);

    return () => {
      window.removeEventListener("resize", setDimension);
    };
  }, [screenSize]);

  const isMobile = screenSize.dynamicWidth < 756;
  console.log(screenSize);

  return (
    <>
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className="rounded-lg border">
        <ResizablePanel defaultSize={isMobile ? 100 : 50}>
          <SingleComponent />
        </ResizablePanel>
        <ResizableHandle className="relative" />
        <ResizablePanel defaultSize={isMobile ? 0 : 50}>
          <SingleComponent />
        </ResizablePanel>
      </ResizablePanelGroup>
      <ModeToggle className="absolute bottom-5 right-5" />
    </>
  );
};

export default Body;

const SingleComponent = () => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState("");
  const [res, setRes] = useState<any>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getdata = async () => {
    if (title.trim().length === 0) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `https://backend.q2w.workers.dev/getdata?title=${title.trim()}`
      );
      setDesc(data.roomData.description);
      setRes(data.roomData);
      console.log(data);
      textareaRef.current?.focus(); // Focus the textarea after getting data
    } catch (error: any) {
      alert("Error" + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  const postData = async () => {
    if (desc.trim().length === 0 || title.trim().length === 0) return;
    setLoading(true);
    // types: multipart/form-data, application/x-www-form-urlencoded
    try {
      const formdata = new FormData();
      formdata.set("title", title);
      formdata.set("description", desc);
      await axios.post(`https://backend.q2w.workers.dev/postdata`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error: any) {
      alert("Error" + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getdata();
  }, []);

  return (
    <div className="p-5 flex flex-col flex-1 h-full">
      <div className="flex flex-col gap-y-5 flex-1">
        <div className="flex gap-x-2 items-center">
          <CopyButtonWrapper copyValue={title} className="w-4 h-4 right-2">
            <Input
              onBlur={getdata}
              disabled={loading}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  getdata();
                  textareaRef.current?.focus(); // Focus the textarea when Enter is pressed
                }
              }}
              className="border-[1px] border-gray-400"
              placeholder="Enter the Room Id"
            />
          </CopyButtonWrapper>
          <Button disabled={loading} onClick={getdata} className="h-fit">
            Search
          </Button>
        </div>
        <CopyButtonWrapper copyValue={desc} className="w-4 h-4 right-3 top-6">
          <Textarea
            disabled={loading}
            value={desc}
            onBlur={postData}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => {
              console.log(e.key);
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault(); // Prevent the default Enter key behavior (new line)
                postData(); // Call the postData function
              }
            }}
            ref={textareaRef} // Set the ref to the textarea
            className="border-[1px] border-gray-400 h-full overflow-x-auto"
            placeholder="Room Data will Display here"
          />
        </CopyButtonWrapper>
      </div>
      <p className="text-xs text-gray-300 py-1">
        Last Modified:&nbsp;
        {moment(res?.updatedAt).format("DD-MMM-YYYY hh:mm:ss")}
      </p>
    </div>
  );
};

const CopyButtonWrapper = ({
  children,
  className,
  copyValue,
}: {
  children: React.ReactNode;
  className?: any;
  copyValue: string;
}) => {
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    if (clicked) {
      const timeout = setTimeout(() => {
        setClicked(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [clicked]);
  return (
    <div className="w-full h-full relative">
      {children}
      {clicked ? (
        <Check
          className={cn("absolute right-0 top-1/2 -translate-y-1/2", className)}
        />
      ) : (
        <Copy
          onClick={() => {
            setClicked(true);
            navigator.clipboard.writeText(copyValue);
          }}
          className={cn("absolute right-0 top-1/2 -translate-y-1/2", className)}
        />
      )}
    </div>
  );
};
