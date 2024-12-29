import { Router } from "express";
import { verifyJWT } from "../../services/jwt";
import { 
  create, 
  login, 
  logout, 
  showMe 
} from "./controller";

const router = Router();

router.post("/", create);
router.post("/login", login);

//Authorized routes
router.get("/", verifyJWT, showMe);
router.post("/logout", verifyJWT, logout);

export default router;