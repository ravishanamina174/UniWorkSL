import Image from "next/image";

export function AboutIllustrations() {
  return <div className="about-illustrations" aria-hidden="true">
    <Image className="about-art about-art-student" src="/teen.png" alt="" width={1536} height={1024} sizes="(max-width: 600px) 235px, (max-width: 1020px) 300px, 390px" />
    <Image className="about-art about-art-poster" src="/grand.png" alt="" width={1024} height={1536} sizes="(max-width: 600px) 100px, (max-width: 1020px) 132px, 172px" />
  </div>;
}
