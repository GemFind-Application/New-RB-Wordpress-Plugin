import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox.css";

window.Fancybox = Fancybox;
Fancybox.bind("[data-fancybox]", {
  on: {
    load: (fancybox, slide) => {
      console.log(
        `This slide is selected: ${fancybox.getSlide().index === slide.index}`
      );
    },
  },
});
