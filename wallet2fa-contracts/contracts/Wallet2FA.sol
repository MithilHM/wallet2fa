// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Wallet2FA
 * @dev Decentralized two-factor authentication using wallet signatures
 * @notice This contract logs authentication events on-chain and mints NFTs for milestones
 */
contract Wallet2FA {
    // Structs
    struct AuthRecord {
        address user;
        uint256 timestamp;
        string service;
        bytes32 sessionHash;
        bool isActive;
    }

    struct UserProfile {
        uint256 totalLogins;
        uint256 lastLogin;
        bool isRegistered;
        uint256 reputationScore;
    }

    // State variables
    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => AuthRecord) public authRecords;
    mapping(address => bytes32[]) public userSessions;
    mapping(address => uint256) public loginNFTBalance;

    // Events
    event UserRegistered(address indexed user, uint256 timestamp);
    event AuthenticationLogged(
        address indexed user,
        bytes32 indexed sessionHash,
        string service,
        uint256 timestamp
    );
    event SessionRevoked(address indexed user, bytes32 sessionHash);
    event LoginNFTMinted(address indexed user, uint256 loginCount);

    // Modifiers
    modifier onlyRegistered() {
        require(userProfiles[msg.sender].isRegistered, "User not registered");
        _;
    }

    /**
     * @dev Register a new user
     */
    function registerUser() external {
        require(!userProfiles[msg.sender].isRegistered, "User already registered");
        
        userProfiles[msg.sender] = UserProfile({
            totalLogins: 0,
            lastLogin: 0,
            isRegistered: true,
            reputationScore: 100
        });

        emit UserRegistered(msg.sender, block.timestamp);
    }

    /**
     * @dev Log an authentication event
     * @param service The service name being authenticated to
     * @param sessionHash Unique hash for this session
     */
    function logAuthentication(string memory service, bytes32 sessionHash) external onlyRegistered {
        require(authRecords[sessionHash].timestamp == 0, "Session hash already used");

        // Create auth record
        authRecords[sessionHash] = AuthRecord({
            user: msg.sender,
            timestamp: block.timestamp,
            service: service,
            sessionHash: sessionHash,
            isActive: true
        });

        // Update user profile
        userProfiles[msg.sender].totalLogins++;
        userProfiles[msg.sender].lastLogin = block.timestamp;
        userProfiles[msg.sender].reputationScore += 5; // Increase reputation

        // Add to user sessions
        userSessions[msg.sender].push(sessionHash);

        emit AuthenticationLogged(msg.sender, sessionHash, service, block.timestamp);

        // Mint NFT every 10 logins
        if (userProfiles[msg.sender].totalLogins % 10 == 0) {
            loginNFTBalance[msg.sender]++;
            emit LoginNFTMinted(msg.sender, userProfiles[msg.sender].totalLogins);
        }
    }

    /**
     * @dev Revoke a session
     * @param sessionHash The session to revoke
     */
    function revokeSession(bytes32 sessionHash) external {
        require(authRecords[sessionHash].user == msg.sender, "Not session owner");
        require(authRecords[sessionHash].isActive, "Session already revoked");

        authRecords[sessionHash].isActive = false;
        emit SessionRevoked(msg.sender, sessionHash);
    }

    /**
     * @dev Get all active sessions for a user
     * @param user The user address
     * @return Array of active session hashes
     */
    function getActiveSessions(address user) external view returns (bytes32[] memory) {
        bytes32[] memory allSessions = userSessions[user];
        uint256 activeCount = 0;

        // Count active sessions
        for (uint256 i = 0; i < allSessions.length; i++) {
            if (authRecords[allSessions[i]].isActive) {
                activeCount++;
            }
        }

        // Create array of active sessions
        bytes32[] memory activeSessions = new bytes32[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allSessions.length; i++) {
            if (authRecords[allSessions[i]].isActive) {
                activeSessions[index] = allSessions[i];
                index++;
            }
        }

        return activeSessions;
    }

    /**
     * @dev Get user statistics
     * @param user The user address
     * @return totalLogins Total number of logins
     * @return lastLogin Timestamp of last login
     * @return reputationScore User's reputation score
     * @return nftBalance Number of login NFTs earned
     */
    function getUserStats(address user) external view returns (
        uint256 totalLogins,
        uint256 lastLogin,
        uint256 reputationScore,
        uint256 nftBalance
    ) {
        UserProfile memory profile = userProfiles[user];
        return (
            profile.totalLogins,
            profile.lastLogin,
            profile.reputationScore,
            loginNFTBalance[user]
        );
    }

    /**
     * @dev Check if user is registered
     * @param user The user address
     * @return bool Registration status
     */
    function isUserRegistered(address user) external view returns (bool) {
        return userProfiles[user].isRegistered;
    }
}
