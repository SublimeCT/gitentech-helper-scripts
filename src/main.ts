import { Application } from "./Application";
import { CourseModule } from "./modules/Course";
import { TestModule } from "./modules/Test";

Application
  .use(new TestModule())
  .use(new CourseModule())

const application = new Application()

application.emit('onInit')
application.onLoad()
application.listenVueRouteChange()
