import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";


gsap.registerPlugin(SplitText, CustomEase, ScrollTrigger, useGSAP);

export { gsap, SplitText, CustomEase, ScrollTrigger, useGSAP };