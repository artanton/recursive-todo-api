const ctrlWrapper = ctrl =>{
    const fu = async (req, res, next)=>{
        try {
            await ctrl(req, res, next)
        } catch (error) {
            next(error)
        }
    }
    return fu;
   
}

export default ctrlWrapper;