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
import { Check, Copy, Github } from "lucide-react";
import { cn } from "../lib/utils";
import axios from "axios";
import moment from "moment";
// let URL = "http://127.0.0.1:8787";
let URL = "https://backend.q2w.workers.dev";
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
  // console.log(screenSize);

  return (
    <>
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className="rounded-lg border">
        <ResizablePanel defaultSize={isMobile ? 100 : 50}>
          <SingleComponent key={1} id={1} />
        </ResizablePanel>
        <ResizableHandle className="relative" />
        <ResizablePanel defaultSize={isMobile ? 0 : 50}>
          <SingleComponent key={2} id={2} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <a target="_blank" href="https://github.com/iamBhanuRathore/q2w">
        <Github className="absolute cursor-pointer h-10 w-10 bottom-20 right-5 border-2 p-1.5 rounded-md" />
      </a>
      <ModeToggle className="absolute bottom-5 right-5" />
    </>
  );
};

export default Body;

const SingleComponent = ({ id }: { id: number }) => {
  let cachedTitle = localStorage.getItem("title" + id);
  if (!cachedTitle || cachedTitle.length > 50) {
    cachedTitle = "";
  }
  // console.log(cachedTitle);
  const [title, setTitle] = useState(cachedTitle);
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState("");
  const [res, setRes] = useState<any>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getdata = async () => {
    if (title.trim().length === 0) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${URL}/getdata?title=${title.trim()}`);
      localStorage.setItem("title" + id, title.trim());
      setDesc(data.roomData.description);

      setRes(data.roomData);
    } catch (error: any) {
      alert("Error" + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  const postData = async () => {
    if (desc.trim().length === 0 || title.trim().length === 0) return;
    setLoading(true);
    try {
      const formdata = new FormData();
      formdata.set("title", title);
      formdata.set("description", desc);
      const { data } = await axios.post(`${URL}/postdata`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setRes(data.data);
      setDesc(data.data.description);
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
              value={title}
              onBlur={async () => {
                if (title.trim() === res.title) return;
                await getdata();
                textareaRef.current?.focus(); // Focus the textarea after getting data
              }}
              disabled={loading}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // getdata();  No need call the getData api because we are already calling the api onBlur
                  textareaRef.current?.focus(); // Focus the textarea when Enter is pressed
                }
              }}
              className="border-[1px] border-gray-400"
              placeholder="Enter the Room Id"
            />
          </CopyButtonWrapper>
          <Button
            disabled={loading}
            onClick={getdata}
            className="h-fit dark:text-gray-200">
            Search
          </Button>
        </div>
        <CopyButtonWrapper copyValue={desc} className="w-4 h-4 right-4 top-6">
          <Textarea
            disabled={loading}
            value={desc}
            onBlur={() => {
              if (desc === res.description) return;
              postData();
            }}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
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
      <div>
        <p className="text-xs text-gray-300 py-1">
          Last Modified:&nbsp;
          {moment(res?.updatedAt).format("DD-MMM-YYYY hh:mm:ss")}
        </p>
      </div>
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
    <div className="w-full h-full relative cursor-pointer ">
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
