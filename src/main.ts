import { Application } from "./Application";
import { CourseModule } from "./modules/Course";
// import { StudyModule } from "./modules/Study";
import { TestModule } from "./modules/Test";
import { TimesheetModule } from "./modules/Timesheet";

Application
  .use(new TestModule())
  // .use(new StudyModule())
  .use(new CourseModule())
  .use(new TimesheetModule())

const application = new Application()

application.emit('onInit')
application.onLoad()
application.listenVueRouteChange()
application.listenAngularRouteChange()
