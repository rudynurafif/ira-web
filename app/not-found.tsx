import Link from "next/link";
// import notFound from "../public/404.png";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center w-full h-screen items-center px-5">
      {/* <Image
        src={notFound}
        alt="not found"
        width={800}
        height={800}
        className="w-[500px] h-auto"
      /> */}
      <div className="text-center">
        <h2 className="text-lg font-bold">Page not found.</h2>
        {/* <p>Could not find requested resource</p> */}
        <div className="w-full pt-10">
          <Link
            href="/"
            className="rounded-full underline-animation bg-blue text-black w-full p-2 font-bold"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
