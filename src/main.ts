import { Application } from "./Application";
import { TestModule } from "./modules/Test";

Application.use(new TestModule())

const application = new Application()

application.emit('onInit')
application.onLoad()
