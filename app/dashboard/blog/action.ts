export  const listPostAction =async({pageNo,pageSize}:{
    pageNo:number, pageSize:number
})=>{
    return{ posts:[], totalCount:0 }
}
export const deletePostAction =async(id:string)=>{}