import { verifyJWT } from "../../services/jwt";
import { create, currentUser, login, logout, showMe } from "./controller";
import { Router } from "express";

const router = Router();

router.post("/", create);
router.post("/login", login);

//Authorized routes
router.get("/", verifyJWT, currentUser);
router.post("/logout", verifyJWT, logout);

export default router;