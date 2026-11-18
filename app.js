const express = require("express");
const { prisma } = require("./prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

let getUsers = async () => {
	let users = await prisma.user.findMany();
	return users;
};

let generateToken = async (user) => {
	return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY);
};

let requireAuth = async ()=>{
	
}

app.use(express.json());

app.post("/signup", async (req, res) => {
	let { email, password } = req.body;

	if(typeof email !== 'string' || typeof password !== 'string'){
        res.status(400).send("BAD REQUEST");
        
        return
    }

	if (password.length < 6) {
		res.status(400).json({ error: "Bad Request" });
		return;
	}
	email = email.trim().toLowerCase();

	let userExists = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	if (userExists === null) {
		let hashedPass = await bcrypt.hash(password, 10);
		let createdUser = await prisma.user.create({
			data: {
				email: email,
				password: hashedPass,
			},
		});
		createdUser["jwt_token"] = await generateToken(createdUser);
		
        res.status(201).send(createdUser);
		
        return;
	} else {
		res.status(409).json({ error: "Email Already Exists" });
		
        return;
	}
});

app.post('/login',async(req,res)=>{
    let {email,password} = req.body;
    
    if(typeof email !== 'string' || typeof password !== 'string'){
        res.status(400).send("BAD REQUEST");
        
        return
    }

    email = email.trim().toLowerCase();
    
    let searchedUser = await prisma.user.findUnique({
        where : {
            email : email
        }
    })
    
    if(!searchedUser){
        res.status(401).send("Unauthorized")
		return
    }
    if(!(await bcrypt.compare(password,searchedUser.password))){
        res.status(401).send("Unauthorized")
		return
    }

    searchedUser.jwt_token = await generateToken(searchedUser);

    res.status(200).json(searchedUser)
})

app.get("/", async (req, res) => {
	res.send(await getUsers());
});

app.listen(process.env.PORT, () => {
	console.log(`Example app listening on port ${process.env.PORT}`);
});
