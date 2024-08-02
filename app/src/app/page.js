'use client'
// import Image from "next/image";
import { useState, useEffect } from "react";
import { db } from '../../firebase.js';
import { Box, Typography, Modal, TextField, Button, Stack } from '@mui/material';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

// Basic styling for UI model component
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #333',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [pantry, setPantry] = useState([]) 
  const [open, setOpen] = useState(false)
  const [queryModal, setQueryModal] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemSearch, setItemsearch] = useState('')
  var [result, setResult] = useState([])

  // retrieving/update items from database
  const fetchPantry = async () => {
    const snapshot = query(collection(db, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() })
    })
    setPantry(pantryList)
    // console.log(pantryList)
  }

  // deleting item from database
  const removeItem = async (item) => {
    const docRef = doc(collection(db, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { qty } = docSnap.data()
      if (qty === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { qty: qty - 1 })
      }
    }
    await fetchPantry()
  }

  // creating/adding item to database
  const addItem = async (item) => {
    var addItem = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
    const docRef = doc(collection(db, 'pantry'), addItem)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { qty } = docSnap.data()
      await setDoc(docRef, { qty: qty + 1 })
    } else {
      await setDoc(docRef, { qty: 1 })
    }
    await fetchPantry()
  }

  // search item in the pantry
  const searchPantry = async(item) => {
    var queryItem = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
    const docRef = doc(collection(db, 'pantry'), queryItem)
    // const docSnap = await getDoc(docRef)
    var resultList = []
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        const { qty } = docSnap.data()
        resultList.push({ item: docRef.id, itemCount: qty})
      } else {
          resultList.push({ item: queryItem, itemCount: 0})
      }
    });
    setResult(resultList)
    await fetchPantry()
  }

  useEffect(() => {
    fetchPantry()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (

    <Box 
    width="100vw"
    height="100vh"
    // bgcolor="#333"
    bgcolor="#f0f0f0"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={'column'}
    alignItems={'center'}
    gap={2}
    >
    <Stack  spacing={3} alignItems={'center'} overflow={'auto'}>

    {/* application title */}
    <Typography variant={'h2'} color={"#333"} textAlign={'center'} fontSize={"50px"}
      fontFamily={'Apple Chancery'} fontWeight={'bold'} fontStyle={'italic'}>
      Pantry Essentials
    </Typography>

    <img width="20%" src="ui-image.webp" />

    {/* Search bar button */}
    <Box 
      border={'1px solid #f0f0f0'}
      // borderRadius='16px'
      width="25%"
      height="8%"
      paddingTop={"12px"}
      // bgcolor={'#333'}
      bgcolor={'#f0f0f0'}
      display={'flex'}
      justifyContent={'right'}
      flexDirection={'column'}
      alignItems={'center'}
    >
      <Stack direction="row" spacing={3}>
        <TextField
          id="outlined-search"
          label="Search item"
          variant="outlined"
          color="secondary"
          InputProps={{ sx: { 
            borderRadius: "5px",
            borderColor: "green",
            width: "100%",
            height: "75%",
            input: { color: 'black' } ,
            label: {color: 'black'},
          } }}
          value={itemSearch}
          onChange={(q) => setItemsearch(q.target.value)}
        />
        <Button style={{ maxWidth: '70px', maxHeight: '40px', minWidth: '10px', minHeight: '10px' }} 
        color="secondary" variant="contained" 
        onClick={() => {
          searchPantry(itemSearch)
          setQueryModal(true)
        }}
        >
              Search
        </Button>
      </Stack> 
    </Box>

    {/* Defining model to display search result */}
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={ queryModal }
      onClose={handleClose}
    >
      <div>
      { result.map(({item, itemCount}) => (
        <Box  
          key = {item}
          sx={style}
        >
          <Stack width="100%" direction={'column'} spacing={2}>
            {/* Display query item and its count */} 
            <Typography variant={'h6'} color={'#333'} textAlign={'center'} 
              fontFamily={'-apple-system'} fontWeight={'light'} fontSize={'35px'}>
              Item: {item}
            </Typography>
            <Typography variant={'h6'} color={'#333'} textAlign={'center'}
              fontFamily={'-apple-system'} fontWeight={'light'} fontSize={'35px'}>
              Count: {itemCount}
            </Typography> 
          </Stack>
          <Button color="secondary" variant="outlined"
              onClick={() => {
                setItemsearch(''),
                setResult([]),
                setQueryModal(false),
                handleClose()
              }}
            >
              Close
          </Button>
        </Box>
      ))} 
      </div>      
    </Modal>
    
    {/* Defining model to add items into pantry  */}
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >

      {/* Button click event to add specified item to pantry */} 
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2" textAlign={'center'}>
          Add Item
        </Typography>
        <Stack width="100%" direction={'row'} spacing={2}>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            color="secondary"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            InputProps={{ sx: { 
              input: { color: 'black' } ,
              label: {color: 'black'},
            } }}
          />
          <Button color="secondary" variant="outlined"
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
          >
            Add
          </Button>
        </Stack>
      </Box>
    </Modal>

    {/* Display available items in pantry */} 
    {/* <Box border={'1px solid #333'}> */}
      <Box 
        width="800px"
        height="100px"
        paddingTop={"15px"}
        // bgcolor={'#333'}
        bgcolor = {"#f0f0f0"}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Stack direction="row" spacing={40}>
          <Typography variant={'h3'} color={'#333'} textAlign={'left'} 
                      fontFamily={'-apple-system'} fontStyle={'italic'} fontWeight={'medium'} fontSize={'48px'}>
            Available Items
          </Typography>
          <Button style={{ maxWidth: '150px', maxHeight: '45px', minWidth: '10px', minHeight: '10px' }}
            color="secondary" variant="contained"  onClick={handleOpen}>
            Add New Item
          </Button>
        </Stack>
      </Box>
      <Stack width="750px" height="500px" spacing={2} overflow={'auto'}>
        {pantry.map(({name, qty}) => (
          <Box
            key={name}
            width="100%"
            maxHeight="50px"
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            // bgcolor={'#333'}
            bgcolor={"#f0f0f0"}
            // paddingX={5}
          >     
            {/* Display each item and its count */} 
            <Typography variant={'h6'} color={'#333'} textAlign={'center'} 
              fontFamily={'-apple-system'} fontWeight={'light'} fontSize={'35px'}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant={'h6'} color={'#333'} textAlign={'center'}
              fontFamily={'-apple-system'} fontWeight={'light'} fontSize={'35px'}>
              Count: {qty}
            </Typography>

            {/* Button click event to remove specified item from pantry */} 
            <Button color="secondary" variant="contained" onClick={() => removeItem(name)}>
              Remove
            </Button>
          </Box>
        ))}
        </Stack>
    {/* </Box> */}
    </Stack>
  </Box> 
  )
}

